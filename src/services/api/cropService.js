import cropsData from "@/services/mockData/crops.json";

class CropService {
  constructor() {
    this.crops = [...cropsData];
  }

  async getAll() {
    await this.delay();
    return [...this.crops];
  }

  async getById(id) {
    await this.delay();
    const crop = this.crops.find(c => c.Id === id);
    if (!crop) {
      throw new Error("Crop not found");
    }
    return { ...crop };
  }

  async getByFarmId(farmId) {
    await this.delay();
    return this.crops.filter(c => c.farmId === farmId).map(c => ({ ...c }));
  }

  async create(cropData) {
    await this.delay();
    const newCrop = {
      ...cropData,
      Id: this.getNextId(),
      status: "active"
    };
    this.crops.push(newCrop);
    return { ...newCrop };
  }

  async update(id, cropData) {
    await this.delay();
    const index = this.crops.findIndex(c => c.Id === id);
    if (index === -1) {
      throw new Error("Crop not found");
    }
    
    const updatedCrop = {
      ...this.crops[index],
      ...cropData,
      Id: id
    };
    
    this.crops[index] = updatedCrop;
    return { ...updatedCrop };
  }

  async delete(id) {
    await this.delay();
    const index = this.crops.findIndex(c => c.Id === id);
    if (index === -1) {
      throw new Error("Crop not found");
    }
    
    this.crops.splice(index, 1);
    return true;
  }

  getNextId() {
    const maxId = Math.max(...this.crops.map(c => c.Id), 0);
    return maxId + 1;
  }

  async delay() {
    return new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));
  }
}

export default new CropService();