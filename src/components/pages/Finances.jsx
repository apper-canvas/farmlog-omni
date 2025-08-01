import React, { useState, useEffect } from "react";
import Header from "@/components/organisms/Header";
import StatCard from "@/components/molecules/StatCard";
import AddTransactionModal from "@/components/organisms/AddTransactionModal";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import Input from "@/components/atoms/Input";
import Badge from "@/components/atoms/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import transactionService from "@/services/api/transactionService";
import farmService from "@/services/api/farmService";
import { toast } from "react-toastify";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import Chart from "react-apexcharts";
const Finances = () => {
const [transactions, setTransactions] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filterFarm, setFilterFarm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [transactionsData, farmsData] = await Promise.all([
        transactionService.getAll(),
        farmService.getAll()
      ]);
      
      setTransactions(transactionsData);
      setFarms(farmsData);
    } catch (err) {
      setError("Failed to load financial data");
      console.error("Finances data loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveTransaction = async (transactionData) => {
    try {
      if (editingTransaction) {
        const updatedTransaction = await transactionService.update(editingTransaction.Id, transactionData);
        setTransactions(prev => prev.map(transaction => 
          transaction.Id === editingTransaction.Id ? updatedTransaction : transaction
        ));
        toast.success("Transaction updated successfully!");
      } else {
        const newTransaction = await transactionService.create(transactionData);
        setTransactions(prev => [...prev, newTransaction]);
        toast.success("Transaction added successfully!");
      }
      
      setEditingTransaction(null);
    } catch (error) {
      toast.error("Failed to save transaction");
      console.error("Transaction save error:", error);
    }
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (!confirm("Are you sure you want to delete this transaction?")) {
      return;
    }
    
    try {
      await transactionService.delete(transactionId);
      setTransactions(prev => prev.filter(t => t.Id !== transactionId));
      toast.success("Transaction deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete transaction");
      console.error("Transaction delete error:", error);
    }
  };

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  // Filter transactions
const getFilteredTransactions = () => {
    let filtered = transactions;
    
    if (filterFarm) {
      filtered = filtered.filter(t => t.farmId === parseInt(filterFarm));
    }
    
    if (filterType) {
      filtered = filtered.filter(t => t.type === filterType);
    }
    
    // Text search filter
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.paymentMethod && t.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    if (filterPeriod !== "all") {
      const now = new Date();
      let startDate, endDate;
      
      switch (filterPeriod) {
        case "month":
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
          break;
        case "year":
          startDate = startOfYear(now);
          endDate = endOfYear(now);
          break;
        default:
          startDate = new Date(0);
          endDate = now;
      }
      
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= startDate && transactionDate <= endDate;
      });
    }
    
    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const filteredTransactions = getFilteredTransactions();

  // Calculate financial statistics
  const calculateStats = (transactions) => {
    const income = transactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const profit = income - expenses;
    const profitMargin = income > 0 ? (profit / income) * 100 : 0;
    
    return { income, expenses, profit, profitMargin };
  };

  const stats = calculateStats(filteredTransactions);

  // Prepare chart data
  const getChartData = () => {
    const monthlyData = {};
    
    filteredTransactions.forEach(transaction => {
      const month = format(new Date(transaction.date), "MMM yyyy");
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expenses: 0 };
      }
      
      if (transaction.type === "income") {
        monthlyData[month].income += transaction.amount;
      } else {
        monthlyData[month].expenses += transaction.amount;
      }
    });
    
    const months = Object.keys(monthlyData).sort((a, b) => new Date(a) - new Date(b));
    const incomeData = months.map(month => monthlyData[month].income);
    const expenseData = months.map(month => monthlyData[month].expenses);
    
    return {
      series: [
        {
          name: "Income",
          data: incomeData
        },
        {
          name: "Expenses",
          data: expenseData
        }
      ],
      options: {
        chart: {
          type: "bar",
          height: 350,
          toolbar: { show: false }
        },
        colors: ["#7CB342", "#F44336"],
        xaxis: {
          categories: months
        },
        yaxis: {
          labels: {
            formatter: (value) => `$${value.toLocaleString()}`
          }
        },
        legend: {
          position: "top"
        },
        dataLabels: {
          enabled: false
        }
      }
    };
  };

  const getFarmName = (farmId) => {
    const farm = farms.find(f => f.Id === farmId);
    return farm ? farm.name : "Unknown Farm";
  };

  const formatCategory = (category) => {
    return category.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) return <Loading type="dashboard" />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6 p-6">
      <Header 
        title="Financial Management" 
        subtitle="Track your farm income and expenses"
      >
        <Button onClick={handleAddTransaction}>
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Add Transaction
        </Button>
      </Header>

      {/* Financial Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Income"
          value={`$${stats.income.toLocaleString()}`}
          icon="TrendingUp"
          trend="up"
          trendValue={`${filteredTransactions.filter(t => t.type === "income").length} transactions`}
          valueColor="text-success"
        />
        
        <StatCard
          title="Total Expenses"
          value={`$${stats.expenses.toLocaleString()}`}
          icon="TrendingDown"
          trend="down"
          trendValue={`${filteredTransactions.filter(t => t.type === "expense").length} transactions`}
          valueColor="text-error"
        />
        
        <StatCard
          title="Net Profit"
          value={`$${stats.profit.toLocaleString()}`}
          icon="DollarSign"
          trend={stats.profit >= 0 ? "up" : "down"}
          trendValue={`${stats.profitMargin.toFixed(1)}% margin`}
          valueColor={stats.profit >= 0 ? "text-success" : "text-error"}
        />
        
        <StatCard
          title="Transactions"
          value={filteredTransactions.length}
          icon="Receipt"
          trend="up"
          trendValue="This period"
        />
      </div>

      {/* Filters */}
<div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <ApperIcon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search transactions by description or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <ApperIcon name="X" size={14} />
              </button>
            )}
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="min-w-48">
              <Select
                value={filterFarm}
                onChange={(e) => setFilterFarm(e.target.value)}
                className="text-sm"
              >
                <option value="">All Farms</option>
                {farms.map((farm) => (
                  <option key={farm.Id} value={farm.Id}>
                    {farm.name}
                  </option>
                ))}
              </Select>
            </div>
            
            <div className="min-w-48">
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="text-sm"
              >
                <option value="">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expenses</option>
              </Select>
            </div>
            
            <div className="min-w-48">
              <Select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="text-sm"
              >
                <option value="all">All Time</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </Select>
            </div>
            
            {(filterFarm || filterType || filterPeriod !== "all" || searchQuery) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilterFarm("");
                  setFilterType("");
                  setFilterPeriod("all");
                  setSearchQuery("");
                }}
              >
                <ApperIcon name="X" size={14} className="mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      {filteredTransactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <Chart {...getChartData()} />
          </CardContent>
        </Card>
      )}

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
<div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            <p className="text-gray-600">
              Showing {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>
          
          {filteredTransactions.length === 0 ? (
            <Empty
              title={transactions.length === 0 ? "No transactions yet" : "No transactions match your filters"}
              description={transactions.length === 0
                ? "Start by recording your first farm transaction" 
                : "Try adjusting your filters to see more transactions"
              }
              icon="Receipt"
              actionLabel={transactions.length === 0 ? "Add Your First Transaction" : "Add New Transaction"}
              onAction={handleAddTransaction}
            />
          ) : (
            <div className="space-y-3">
              {filteredTransactions.slice(0, 20).map((transaction) => (
                <div key={transaction.Id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      transaction.type === "income" ? "bg-success" : "bg-error"
                    }`} />
                    <div>
                      <div className="font-medium">{transaction.description}</div>
                      <div className="text-sm text-gray-600">
                        {getFarmName(transaction.farmId)} • {formatCategory(transaction.category)} • 
                        {format(new Date(transaction.date), "MMM dd, yyyy")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className={`text-lg font-semibold ${
                      transaction.type === "income" ? "text-success" : "text-error"
                    }`}>
                      {transaction.type === "income" ? "+" : "-"}${transaction.amount.toLocaleString()}
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditTransaction(transaction)}
                      >
                        <ApperIcon name="Edit" size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteTransaction(transaction.Id)}
                        className="text-error hover:bg-red-50"
                      >
                        <ApperIcon name="Trash2" size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
{filteredTransactions.length > 20 && (
                <div className="text-center py-4">
                  <p className="text-gray-600">
                    Showing first 20 of {filteredTransactions.length} transactions
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      // This could be expanded to implement pagination
                      toast.info("Pagination feature coming soon!");
                    }}
                  >
                    Load More
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        transaction={editingTransaction}
      />
    </div>
  );
};

export default Finances;