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

    // Generate real chart data from recent orders
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentOrders = await prisma.order.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, totalAmount: true, paymentStatus: true }
    });

    const revenueByMonth = new Map();
    const ordersByDay = new Map();

    // Initialize days
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    dayNames.forEach(d => ordersByDay.set(d, 0));

    recentOrders.forEach(o => {
      // Month Revenue
      const month = o.createdAt.toLocaleString('default', { month: 'short' });
      if (o.paymentStatus === "PAID") {
        revenueByMonth.set(month, (revenueByMonth.get(month) || 0) + o.totalAmount);
      }
      
      // Daily Orders (last 7 days approx, grouping by weekday)
      const day = dayNames[o.createdAt.getDay()];
      ordersByDay.set(day, ordersByDay.get(day) + 1);
    });

    const revenueData = Array.from(revenueByMonth.entries()).map(([month, revenue]) => ({ month, revenue }));
    if (revenueData.length === 0) {
      revenueData.push({ month: new Date().toLocaleString('default', { month: 'short' }), revenue: 0 });
    }

    const orderData = Array.from(ordersByDay.entries()).map(([day, orders]) => ({ day, orders }));

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
