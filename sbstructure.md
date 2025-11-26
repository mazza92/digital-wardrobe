| table_name          | column_name   | data_type                   | is_nullable |
| ------------------- | ------------- | --------------------------- | ----------- |
| brands              | id            | text                        | NO          |
| brands              | name          | text                        | NO          |
| brands              | logoUrl       | text                        | YES         |
| brands              | affiliateApi  | text                        | YES         |
| brands              | createdAt     | timestamp without time zone | NO          |
| brands              | updatedAt     | timestamp without time zone | NO          |
| favorites_analytics | id            | text                        | NO          |
| favorites_analytics | productId     | text                        | NO          |
| favorites_analytics | favorites     | integer                     | NO          |
| favorites_analytics | unfavorites   | integer                     | NO          |
| favorites_analytics | date          | timestamp without time zone | NO          |
| outfit_analytics    | id            | text                        | NO          |
| outfit_analytics    | outfitId      | text                        | NO          |
| outfit_analytics    | clicks        | integer                     | NO          |
| outfit_analytics    | revenue       | double precision            | NO          |
| outfit_analytics    | date          | timestamp without time zone | NO          |
| outfits             | id            | text                        | NO          |
| outfits             | title         | text                        | NO          |
| outfits             | description   | text                        | YES         |
| outfits             | imageUrl      | text                        | NO          |
| outfits             | isPublished   | boolean                     | NO          |
| outfits             | createdAt     | timestamp without time zone | NO          |
| outfits             | updatedAt     | timestamp without time zone | NO          |
| outfits             | category      | text                        | YES         |
| product_analytics   | id            | text                        | NO          |
| product_analytics   | productId     | text                        | NO          |
| product_analytics   | clicks        | integer                     | NO          |
| product_analytics   | revenue       | double precision            | NO          |
| product_analytics   | date          | timestamp without time zone | NO          |
| products            | id            | text                        | NO          |
| products            | name          | text                        | NO          |
| products            | brand         | text                        | NO          |
| products            | price         | text                        | YES         |
| products            | affiliateLink | text                        | YES         |
| products            | x             | double precision            | NO          |
| products            | y             | double precision            | NO          |
| products            | outfitId      | text                        | NO          |
| products            | createdAt     | timestamp without time zone | NO          |
| products            | updatedAt     | timestamp without time zone | NO          |
| products            | imageUrl      | text                        | YES         |
| profiles            | id            | text                        | NO          |
| profiles            | name          | text                        | NO          |
| profiles            | brand         | text                        | NO          |
| profiles            | bio           | text                        | NO          |
| profiles            | heroImage     | text                        | NO          |
| profiles            | socialMedia   | jsonb                       | YES         |
| profiles            | createdAt     | timestamp without time zone | NO          |
| profiles            | updatedAt     | timestamp without time zone | NO          |
| users               | id            | text                        | NO          |
| users               | email         | text                        | NO          |
| users               | password      | text                        | NO          |
| users               | name          | text                        | NO          |
| users               | createdAt     | timestamp without time zone | NO          |
| users               | updatedAt     | timestamp without time zone | NO          |