import type { OrderStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { CreateOrderInput } from "@/schemas/order.schema";

export type CreatedOrderResult = {
  id: string;
  whatsappUrl: string | null;
};

const sellerTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
  DISPUTED: [],
};

export async function createOrder(
  input: CreateOrderInput,
  buyerId: string,
): Promise<CreatedOrderResult> {
  const buyer = await prisma.user.findFirst({
    where: {
      id: buyerId,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
    },
  });

  if (!buyer) {
    throw new Error("يجب تسجيل الدخول أولاً");
  }

  const listing = await prisma.listing.findFirst({
    where: {
      id: input.listingId,
      deletedAt: null,
      status: "ACTIVE",
    },
    select: {
      id: true,
      title: true,
      type: true,
      price: true,
      quantity: true,
      sellerId: true,
      deliveryMethod: true,
      seller: {
        select: {
          name: true,
          profile: {
            select: {
              whatsapp: true,
              showWhatsapp: true,
            },
          },
        },
      },
    },
  });

  if (!listing) {
    throw new Error("هذا المنتج غير متاح حالياً");
  }

  if (listing.sellerId === buyerId) {
    throw new Error("لا يمكنك الطلب من منتجك الخاص");
  }

  const quantity = listing.type === "SERVICE" ? 1 : input.quantity;

  if (listing.type === "SERVICE" && input.note.trim().length < 20) {
    throw new Error("اكتب وصف طلبك بما لا يقل عن 20 حرفاً");
  }

  if (listing.type === "PHYSICAL" && listing.quantity !== null && quantity > listing.quantity) {
    throw new Error("الكمية المطلوبة تتجاوز المتاح");
  }

  if (listing.deliveryMethod === "DELIVERY" && input.address.trim().length < 5) {
    throw new Error("اكتب عنوان التوصيل بشكل واضح");
  }

  const totalPrice = listing.price * quantity;

  const order = await prisma.$transaction(async (tx) => {
    const createdOrder = await tx.order.create({
      data: {
        listingId: listing.id,
        buyerId,
        quantity,
        totalPrice,
        note: input.note.trim() || null,
        contactMethod: input.contactMethod,
        address: input.address.trim() || null,
      },
      select: {
        id: true,
      },
    });

    if (listing.type === "PHYSICAL" && listing.quantity !== null) {
      const nextQuantity = Math.max(listing.quantity - quantity, 0);

      await tx.listing.update({
        where: {
          id: listing.id,
        },
        data: {
          quantity: nextQuantity,
          status: nextQuantity === 0 ? "SOLD_OUT" : "ACTIVE",
        },
      });
    }

    await tx.notification.create({
      data: {
        userId: listing.sellerId,
        type: "SYSTEM",
        message: `طلب جديد على: ${listing.title}`,
        link: "/dashboard/orders/received",
      },
    });

    return createdOrder;
  });

  const whatsappUrl =
    input.contactMethod === "WHATSAPP" &&
    listing.seller.profile?.showWhatsapp &&
    listing.seller.profile.whatsapp
      ? buildOrderWhatsappUrl({
          phone: listing.seller.profile.whatsapp,
          buyerName: buyer.name,
          listingTitle: listing.title,
          orderId: order.id,
          note: input.note,
        })
      : null;

  return {
    id: order.id,
    whatsappUrl,
  };
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  sellerId: string,
) {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      listing: {
        sellerId,
      },
    },
    select: {
      id: true,
      status: true,
      buyerId: true,
      listing: {
        select: {
          title: true,
        },
      },
    },
  });

  if (!order) {
    throw new Error("ليس لديك صلاحية لتعديل هذا الطلب");
  }

  if (!sellerTransitions[order.status].includes(status)) {
    throw new Error("لا يمكن نقل الطلب إلى هذه الحالة");
  }

  await prisma.$transaction([
    prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        status,
      },
    }),
    prisma.notification.create({
      data: {
        userId: order.buyerId,
        type: "SYSTEM",
        message: buildOrderStatusMessage(order.listing.title, status),
        link: "/dashboard/orders",
      },
    }),
  ]);
}

export async function cancelOrder(orderId: string, buyerId: string) {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      buyerId,
      status: "PENDING",
    },
    select: {
      id: true,
      quantity: true,
      listingId: true,
      listing: {
        select: {
          title: true,
          type: true,
          sellerId: true,
          quantity: true,
        },
      },
    },
  });

  if (!order) {
    throw new Error("لا يمكن إلغاء هذا الطلب");
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: {
        id: order.id,
      },
      data: {
        status: "CANCELLED",
      },
    });

    if (order.listing.type === "PHYSICAL" && order.listing.quantity !== null) {
      await tx.listing.update({
        where: {
          id: order.listingId,
        },
        data: {
          quantity: {
            increment: order.quantity,
          },
          status: "ACTIVE",
        },
      });
    }

    await tx.notification.create({
      data: {
        userId: order.listing.sellerId,
        type: "SYSTEM",
        message: `تم إلغاء الطلب على: ${order.listing.title}`,
        link: "/dashboard/orders/received",
      },
    });
  });
}

function buildOrderStatusMessage(title: string, status: OrderStatus) {
  if (status === "CONFIRMED") {
    return `تم تأكيد طلبك على: ${title}`;
  }

  if (status === "IN_PROGRESS") {
    return `بدأ تنفيذ طلبك على: ${title}`;
  }

  if (status === "COMPLETED") {
    return `تم إنجاز طلبك على: ${title}`;
  }

  if (status === "CANCELLED") {
    return `تم إلغاء طلبك على: ${title}`;
  }

  return `تم تحديث حالة طلبك على: ${title}`;
}

function buildOrderWhatsappUrl({
  phone,
  buyerName,
  listingTitle,
  orderId,
  note,
}: {
  phone: string;
  buyerName: string;
  listingTitle: string;
  orderId: string;
  note?: string;
}) {
  const message = [
    `مرحباً، أنا ${buyerName} طلبت ${listingTitle} عبر أرزاق.`,
    `رقم الطلب: ${orderId}`,
    note?.trim() ? `ملاحظة: ${note.trim()}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
