import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session || ((session.user as any)?.role !== "ADMIN" && (session.user as any)?.role !== "STAFF")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const totalOrders = await prisma.order.count();
    const pendingOrders = await prisma.order.count({ where: { status: "PICKUP_SCHEDULED" } });
    const inTransitOrders = await prisma.order.count({ where: { status: "IN_TRANSIT" } });
    const deliveredOrders = await prisma.order.count({ where: { status: "DELIVERED" } });
    const cancelledOrders = await prisma.order.count({ where: { status: "CANCELLED" } });

    const totalRevenueResult = await prisma.order.aggregate({
      where: { paymentStatus: "PAID" },
      _sum: { totalAmount: true },
    });
    const totalRevenue = totalRevenueResult._sum.totalAmount || 0;

    const courierStats = await prisma.courierPartner.findMany({
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    const courierPerformance = courierStats.map((c) => ({
      name: c.name,
      code: c.code,
      ordersCount: c._count.orders,
    }));

    // Generate standard mock chart data for admin view
    const revenueData = [
      { month: "Jan", revenue: Math.round(totalRevenue * 0.1) },
      { month: "Feb", revenue: Math.round(totalRevenue * 0.15) },
      { month: "Mar", revenue: Math.round(totalRevenue * 0.2) },
      { month: "Apr", revenue: Math.round(totalRevenue * 0.25) },
      { month: "May", revenue: Math.round(totalRevenue * 0.3) },
      { month: "Jun", revenue: totalRevenue },
    ];

    const orderData = [
      { day: "Mon", orders: Math.round(totalOrders * 0.12) },
      { day: "Tue", orders: Math.round(totalOrders * 0.18) },
      { day: "Wed", orders: Math.round(totalOrders * 0.15) },
      { day: "Thu", orders: Math.round(totalOrders * 0.22) },
      { day: "Fri", orders: Math.round(totalOrders * 0.16) },
      { day: "Sat", orders: Math.round(totalOrders * 0.17) },
    ];

    return NextResponse.json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        inTransitOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue,
      },
      courierPerformance,
      revenueData,
      orderData,
    });
  } catch (error) {
    console.error("Admin Dashboard API Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
