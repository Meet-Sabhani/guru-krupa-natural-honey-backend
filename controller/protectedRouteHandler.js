export const protectedRouteHandler = async (req, res) => {
  try {
    const dashboardData = {
      totalOrders: 1200,
      totalRevenue: 45000, // in USD
      totalUsers: 350,
      pendingOrders: 35,
      topSellingProducts: [
        { name: "Organic Wild Honey", sales: 450 },
        { name: "Raw Forest Honey", sales: 320 },
        { name: "Multiflora Honey", sales: 280 },
      ],
      recentOrders: [
        {
          id: "ORD12345",
          customer: "John Doe",
          total: 45,
          status: "Delivered",
        },
        {
          id: "ORD12346",
          customer: "Jane Smith",
          total: 30,
          status: "Pending",
        },
        {
          id: "ORD12347",
          customer: "Alice Johnson",
          total: 50,
          status: "Processing",
        },
      ],
      revenueChart: [
        { month: "Jan", revenue: 3000 },
        { month: "Feb", revenue: 4000 },
        { month: "Mar", revenue: 3500 },
        { month: "Apr", revenue: 5000 },
        { month: "May", revenue: 4500 },
        { month: "Jun", revenue: 5500 },
      ],
    };

    res.status(200).json({
      success: true,
      message: "Admin dashboard data retrieved successfully",
      data: dashboardData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard data",
      error: error.message,
    });
  }
};
