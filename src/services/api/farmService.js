import farmsData from "@/services/mockData/farms.json";

class FarmService {
  constructor() {
    this.farms = [...farmsData];
  }

  async getAll() {
    await this.delay();
    return [...this.farms];
  }

  async getById(id) {
    await this.delay();
    const farm = this.farms.find(f => f.Id === id);
    if (!farm) {
      throw new Error("Farm not found");
    }
    return { ...farm };
  }

  async create(farmData) {
    await this.delay();
    const newFarm = {
      ...farmData,
      Id: this.getNextId(),
      createdAt: new Date().toISOString()
    };
    this.farms.push(newFarm);
    return { ...newFarm };
  }

  async update(id, farmData) {
    await this.delay();
    const index = this.farms.findIndex(f => f.Id === id);
    if (index === -1) {
      throw new Error("Farm not found");
    }
    
    const updatedFarm = {
      ...this.farms[index],
      ...farmData,
      Id: id
    };
    
    this.farms[index] = updatedFarm;
    return { ...updatedFarm };
  }

  async delete(id) {
    await this.delay();
    const index = this.farms.findIndex(f => f.Id === id);
    if (index === -1) {
      throw new Error("Farm not found");
    }
    
    this.farms.splice(index, 1);
    return true;
  }

  getNextId() {
    const maxId = Math.max(...this.farms.map(f => f.Id), 0);
    return maxId + 1;
  }

  async delay() {
    return new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));
  }
}

export default new FarmService();