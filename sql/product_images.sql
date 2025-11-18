CREATE TABLE product_images (
    product_id TEXT NOT NULL,
    image_id TEXT NOT NULL,
    display_order INTEGER,
    PRIMARY KEY (product_id, image_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE
);
