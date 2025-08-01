import transactionsData from "@/services/mockData/transactions.json";

class TransactionService {
  constructor() {
    this.transactions = [...transactionsData];
  }

  async getAll() {
    await this.delay();
    return [...this.transactions];
  }

  async getById(id) {
    await this.delay();
    const transaction = this.transactions.find(t => t.Id === id);
    if (!transaction) {
      throw new Error("Transaction not found");
    }
    return { ...transaction };
  }

  async getByFarmId(farmId) {
    await this.delay();
    return this.transactions.filter(t => t.farmId === farmId).map(t => ({ ...t }));
  }

  async create(transactionData) {
    await this.delay();
    const newTransaction = {
      ...transactionData,
      Id: this.getNextId()
    };
    this.transactions.push(newTransaction);
    return { ...newTransaction };
  }

  async update(id, transactionData) {
    await this.delay();
    const index = this.transactions.findIndex(t => t.Id === id);
    if (index === -1) {
      throw new Error("Transaction not found");
    }
    
    const updatedTransaction = {
      ...this.transactions[index],
      ...transactionData,
      Id: id
    };
    
    this.transactions[index] = updatedTransaction;
    return { ...updatedTransaction };
  }

  async delete(id) {
    await this.delay();
    const index = this.transactions.findIndex(t => t.Id === id);
    if (index === -1) {
      throw new Error("Transaction not found");
    }
    
    this.transactions.splice(index, 1);
    return true;
  }

  getNextId() {
    const maxId = Math.max(...this.transactions.map(t => t.Id), 0);
    return maxId + 1;
  }

  async delay() {
    return new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));
  }
}

export default new TransactionService();