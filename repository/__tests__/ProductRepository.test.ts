import { Pool, PoolClient } from 'pg';
import { ProductRepository } from '../ProductRepository';
import { IProduct } from '../../dto/IProduct';
// import { pool } from '../db';

describe('ProductRepository', () => {
  let productRepository: ProductRepository;
  let client: Pool;

  beforeAll(async () => {
    client = new Pool({ connectionString: `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}` });
    productRepository = new ProductRepository(client);
  });

  afterAll(async () => {
    await client.end();
  });

  describe('connection works', () => {
    it('should connect to the database', async () => {
      const res = await client.query('SELECT NOW()');
      console.log(res)
      expect(res).toBeDefined();
    })
  })

  describe('with data', () => {
    beforeEach(async () => {
      await client.query('BEGIN');
      await client.query('DELETE FROM products');
      await client.query(
        "INSERT INTO products (id, name, description, price, stock, whatsapp_product_id) VALUES ('prod1', 'Laptop', 'Powerful laptop for work and gaming', 1200, 50, 'wp_prod_123')"
      );
      await client.query(
        "INSERT INTO products (id, name, description, price, stock) VALUES ('prod2', 'Mouse', 'Wireless ergonomic mouse', 25, 200)"
      );
    });

    afterEach(async () => {
      await client.query('ROLLBACK');
    });

    it('should be defined', () => {
      expect(productRepository).toBeDefined();
    });

    describe('getAll', () => {
      it('should return all products', async () => {
        const products = await productRepository.getAll();
        expect(products).toHaveLength(2);
        expect(products.map(p => p.name)).toEqual(expect.arrayContaining(['Mouse', 'Laptop']));
      });
    });

    describe('getById', () => {
      it('should return a product by id', async () => {
        const product = await productRepository.getById('prod1');
        expect(product).toBeDefined();
        expect(product?.name).toBe('Laptop');
      });

      it('should return null if product not found', async () => {
        const product = await productRepository.getById('prod3');
        expect(product).toBeNull();
      });
    });

    describe('create', () => {
      it('should create a new product', async () => {
        const newProduct: IProduct = {
          id: 'prod3',
          name: 'Keyboard',
          description: 'Mechanical keyboard',
          price: 80,
          stock: 100,
          whatsapp_product_id: null,
          created_at: new Date(),
          updated_at: new Date(),
        };
        const createdProduct = await productRepository.create(newProduct);
        expect(createdProduct).toBeDefined();
        expect(createdProduct.id).toBe('prod3');

        const products = await productRepository.getAll();
        expect(products).toHaveLength(3);
      });
    });

    describe('update', () => {
      it('should update an existing product', async () => {
        const updates: Partial<IProduct> = {
          price: 1100,
          stock: 40,
        };
        const updatedProduct = await productRepository.update('prod1', updates);
        expect(updatedProduct).toBeDefined();
        expect(updatedProduct?.price).toBe(1100);
        expect(updatedProduct?.stock).toBe(40);
      });

      it('should return null if product to update is not found', async () => {
        const updates: Partial<IProduct> = {
          price: 1100,
        };
        const updatedProduct = await productRepository.update('prod3', updates);
        expect(updatedProduct).toBeNull();
      });
    });
  })
});