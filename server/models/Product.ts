
export default class Product {
    id: number;
    title: string;
    details: string;
    price: number;
    stock: number;

    constructor(id: number, title: string, details: string, price:number, stock: number){
        this.id = id;
        this.title = title;
        this.details = details;
        this.price = price;
        this.stock = stock;
    }
}