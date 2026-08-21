import { IProductWithUnitsSold } from '@/Nenichat/Products/domain/IProduct';

export interface TemplateVariables {
  products?: IProductWithUnitsSold[];
}

export function renderTemplate(template: string, vars: TemplateVariables): string {
  let result = template;

  const activeProducts = (vars.products || []).filter((p) => p.is_active);

  if (activeProducts.length > 0) {
    const productList = activeProducts
      .map((p) => `- ${p.name}`)
      .join('\n');

    result = result.replace(/\{products\}/g, productList);
  } else {
    result = result.replace(/\{products\}/g, '_Nenhum produto ativo no momento_');
  }

  return result;
}
