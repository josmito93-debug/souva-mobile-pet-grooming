export interface Product {
  id: string;
  name: string;
  subtitle: string;
  category: "bundles" | "bath" | "care" | "fragrance" | "accessories";
  price: number;
  originalPrice?: number;
  image: string;
  badge?: string;
  rating: number;
  reviewsCount: number;
  volume?: string;
  description: string;
  ingredients?: string[];
  benefits: string[];
  howToUse: string;
  inStock: boolean;
  isBundle?: boolean;
  bundleItems?: string[];
}

export const SOUVA_PRODUCTS: Product[] = [
  // ─── PAQUETES / BUNDLES ───
  {
    id: "bundle-ritual-vip",
    name: "Ritual de Belleza VIP SOUVA",
    subtitle: "El kit definitivo de spa y cuidado en casa",
    category: "bundles",
    price: 69,
    originalPrice: 88,
    image: "/assets/souva-products.png",
    badge: "MÁS VENDIDO · AHORRA $19",
    rating: 5.0,
    reviewsCount: 48,
    isBundle: true,
    bundleItems: [
      "Champú Revitalizante de Avena (250ml)",
      "Enjuague Suavizante Desenredante (250ml)",
      "Colonia Esencia Refrescante (100ml)",
      "Bálsamo Reparador de Patas & Trufa",
      "Cepillo de Madera Premium de cerdas naturales",
      "Bolsa de compras de lujo SOUVA de regalo",
    ],
    description:
      "La experiencia completa de estética canina SOUVA en tu hogar. Creado para transformar el baño semanal en una sesión de relajación y bienestar aromático.",
    benefits: [
      "Ahorras un 22% frente a la compra individual",
      "Manto sedoso, fácil de peinar y libre de nudos",
      "Patitas protegidas contra sequedad y asfalto",
      "Aroma duradero a eucalipto y flores limpias",
    ],
    howToUse:
      "Usa el champú sobre pelaje húmedo masajeando suavemente. Aplica el enjuague y aclara con agua tibia. Cepilla suavemente con el cepillo de madera mientras secas. Finaliza aplicando una pequeña cantidad de bálsamo en las almohadillas y un toque de colonia en el lomo.",
    inStock: true,
  },
  {
    id: "bundle-esencial-bano",
    name: "Pack Esencial Baño & Brillo",
    subtitle: "Trío de higiene y desenredado sedoso",
    category: "bundles",
    price: 44,
    originalPrice: 54,
    image: "/assets/souva-products.png",
    badge: "AHORRA $10",
    rating: 4.9,
    reviewsCount: 36,
    isBundle: true,
    bundleItems: [
      "Champú Revitalizante (250ml)",
      "Enjuague Suavizante (250ml)",
      "Spray Desenredante Ligero (150ml)",
    ],
    description:
      "El trío fundamental para perros con manto medio a largo. Limpia profundamente respetando el pH cutáneo canino y evita los tirones al cepillar.",
    benefits: [
      "Fórmula biodegradable y vegana",
      "Reduce el tiempo de secado y cepillado",
      "Apto para cachorros y pieles sensibles",
    ],
    howToUse:
      "Baño en 2 pasos con champú y enjuague. Rocía el spray desenredante antes de cepillar para eliminar nudos con total suavidad.",
    inStock: true,
  },
  {
    id: "bundle-patitas-piel",
    name: "Pack Reparador Patitas & Manto",
    subtitle: "Hidratación profunda para pieles secas y almohadillas",
    category: "bundles",
    price: 42,
    originalPrice: 52,
    image: "/assets/prod-balsamo.png",
    badge: "RECOMENDADO VETERINARIO",
    rating: 4.95,
    reviewsCount: 29,
    isBundle: true,
    bundleItems: [
      "Bálsamo Reparador de Patas (Lata dorada 60g)",
      "Champú Hidratante Profesional 250ml",
      "Cepillo de Madera Noble Premium",
    ],
    description:
      "Tratamiento intensivo para patas agrietadas y mantos que necesitan nutrición extra contra el clima seco o frío.",
    benefits: [
      "Alivia almohadillas irritadas por pavimento o pasto",
      "Cera 100% natural libre de tóxicos (seguro si lo lame)",
      "Cepillo ergonómico que estimula la circulación",
    ],
    howToUse:
      "Aplica el bálsamo diariamente en las almohadillas y trufa dando un masaje circular. Usa el champú en cada baño habitual.",
    inStock: true,
  },
  {
    id: "bundle-paseo-fresco",
    name: "Dúo Paseo Fresco & Sin Olores",
    subtitle: "Para mantenerlo impecable entre sesiones de grooming",
    category: "bundles",
    price: 32,
    originalPrice: 40,
    image: "/assets/prod-colonia.png",
    badge: "IDEAL POST-PASEO",
    rating: 4.85,
    reviewsCount: 21,
    isBundle: true,
    bundleItems: [
      "Colonia Esencia Refrescante (100ml)",
      "Spray Desenredante (150ml)",
      "Jabón Artesanal de Avena (100g)",
    ],
    description:
      "Perfecto para refrescar a tu mascota al regresar del parque, neutralizar olores y desenredar ramitas o polvo.",
    benefits: [
      "Neutralizador botánico de olores sin alcohol",
      "No mancha el pelaje blanco ni opaca mantos oscuros",
    ],
    howToUse:
      "Rocía a 20 cm del pelaje evitando ojos y boca. Pasa el cepillo para distribuir el aroma.",
    inStock: true,
  },

  // ─── COSMÉTICA INDIVIDUAL: BAÑO ───
  {
    id: "prod-champu-revitalizante",
    name: "Champú Revitalizante de Avena",
    subtitle: "Aroma suave de eucalipto fresco y avena coloidal",
    category: "bath",
    price: 18,
    image: "/assets/prod-champu.png",
    badge: "TOP VENTAS",
    rating: 4.9,
    reviewsCount: 64,
    volume: "250 ml / 8.4 fl oz",
    description:
      "Fórmula ultra suave diseñada para limpiar a fondo sin eliminar los aceites naturales de la piel. La avena coloidal calma la picazón mientras que el eucalipto aporta un frescor botánico relajante.",
    ingredients: [
      "Agua purificada ozonizada",
      "Avena coloidal orgánica",
      "Aceite esencial de eucalipto globulus",
      "Extracto de manzanilla dulce",
      "Pantenol (Provitamina B5)",
      "Tensoactivos derivados de coco",
    ],
    benefits: [
      "pH balanceado 7.0 específico para perros",
      "Sin lágrimas, hipoalergénico y biodegradable",
      "Alivia picores y piel seca",
    ],
    howToUse:
      "Moja el pelo con agua tibia. Aplica generosamente desde el cuello hasta la cola masajeando hasta formar una espuma densa y aromática. Deja actuar 3 minutos y aclara con abundante agua.",
    inStock: true,
  },
  {
    id: "prod-enjuaje-suavizante",
    name: "Enjuague Suavizante & Desenredante",
    subtitle: "Acondicionador nutritivo con aceite de coco y karité",
    category: "bath",
    price: 18,
    image: "/assets/prod-enjuaje.png",
    rating: 4.85,
    reviewsCount: 42,
    volume: "250 ml / 8.4 fl oz",
    description:
      "Suaviza la cutícula del pelo dejándolo ultra sedoso, brillante y fácil de desenredar. Reduce la acumulación de electricidad estática y suciedad.",
    ingredients: [
      "Aceite de coco virgen prensado en frío",
      "Manteca de karité pura",
      "Proteína de seda hidrolizada",
      "Vitamina E natural (Tocoferol)",
    ],
    benefits: [
      "Elimina nudos sin tirones",
      "Aporta brillo espejo a cualquier tipo de pelaje",
      "Efecto antiestático de larga duración",
    ],
    howToUse:
      "Aplica tras aclarar el champú. Distribuye uniformemente de medios a puntas. Deja reposar 2 minutos y aclara ligeramente.",
    inStock: true,
  },
  {
    id: "prod-jabon-artesanal",
    name: "Jabón Artesanal de Eucalipto & Avena",
    subtitle: "Pastilla sólida prensada en frío para patas y baño rápido",
    category: "bath",
    price: 12,
    image: "/assets/prod-jabon.png",
    rating: 4.8,
    reviewsCount: 31,
    volume: "120 g",
    description:
      "Elaborado a mano con aceites vegetales saponificados y copos de avena triturados que exfolian suavemente la suciedad de las patitas después del paseo.",
    ingredients: [
      "Aceite de oliva virgen extra",
      "Aceite de coco",
      "Avena orgánica molida",
      "Aceite esencial puro de eucalipto",
    ],
    benefits: [
      "Zero waste: empaque en papel reciclable de diseño",
      "Ideal para lavar patas rápidamente en el lavabo",
      "Duración de más de 40 lavados",
    ],
    howToUse:
      "Frota la pastilla directamente en las patas o vientre húmedo con un masaje suave y enjuaga con agua.",
    inStock: true,
  },
  {
    id: "prod-champu-profesional",
    name: "Champú Hidratante Profesional 2en1",
    subtitle: "Envase ámbar dosificador · Nutrición concentrada",
    category: "bath",
    price: 22,
    image: "/assets/prod-amber-shampoo.png",
    badge: "FÓRMULA SALÓN",
    rating: 5.0,
    reviewsCount: 19,
    volume: "250 ml",
    description:
      "La misma fórmula empleada en nuestras vans móviles de spa. Combina limpieza profunda con agentes acondicionadores premium para un acabado de exposición.",
    ingredients: [
      "Extracto de caléndula",
      "Aceite de jojoba orgánico",
      "Biotina vegetal",
      "Aloe vera puro",
    ],
    benefits: [
      "Acelera el secado hasta un 30%",
      "Especialmente formulado para mantos gruesos o rizados (Doodles, Caniches)",
    ],
    howToUse:
      "Aplica una pequeña cantidad gracias a su dosificador de precisión y masajea por todo el cuerpo.",
    inStock: true,
  },

  // ─── CUIDADO ESPECIAL & PATITAS ───
  {
    id: "prod-balsamo-patas",
    name: "Bálsamo Reparador para Patas & Trufa",
    subtitle: "Formulado con amor · Cera de abejas y karité",
    category: "care",
    price: 16,
    image: "/assets/prod-balsamo.png",
    badge: "100% COMESTIBLE / SEGURO",
    rating: 5.0,
    reviewsCount: 77,
    volume: "60 g",
    description:
      "Crea una barrera protectora natural y nutritiva que regenera almohadillas resecas, callos de codos y trufas agrietadas. Sin fragancias artificiales que irriten el olfato canino.",
    ingredients: [
      "Cera de abejas pura de apicultura sostenible",
      "Manteca de karité sin refinar",
      "Aceite de coco virgen",
      "Aceite de almendras dulces",
      "Extracto de caléndula cicatrizante",
    ],
    benefits: [
      "Protege contra el calor del pavimento y la sal del invierno",
      "Totalmente seguro e inocuo si el perro se lame",
      "Absorción rápida que no mancha el suelo",
    ],
    howToUse:
      "Toma una pequeña cantidad con la yema de los dedos y aplica con suave masaje en las almohadillas limpias antes de dormir o salir.",
    inStock: true,
  },
  {
    id: "prod-spray-desenredante",
    name: "Spray Desenredante & Brillo",
    subtitle: "Bruma ligera acondicionadora sin aclarado",
    category: "care",
    price: 15,
    image: "/assets/prod-spray.png",
    rating: 4.85,
    reviewsCount: 38,
    volume: "150 ml / 5 fl oz",
    description:
      "Deshace nudos difíciles al instante sin tirones ni dolor. Enriquecido con vitaminas que sellan la cutícula y aportan un aroma fresco.",
    ingredients: [
      "Agua desionizada",
      "Aceite de argán hidrosoluble",
      "Proteína de trigo hidrolizada",
      "Esencia de hojas de té verde",
    ],
    benefits: [
      "Evita cortes de pelo drásticos por enredos",
      "Facilita el cepillado diario en perros de pelo largo",
    ],
    howToUse:
      "Pulveriza directamente sobre los nudos a 15 cm de distancia, deja actuar 1 minuto y pasa el cepillo con suavidad.",
    inStock: true,
  },
  {
    id: "prod-cepillo-madera",
    name: "Cepillo de Madera Premium",
    subtitle: "Madera noble ecológica con cerdas suaves de puntas pulidas",
    category: "care",
    price: 18,
    image: "/assets/prod-cepillo.png",
    rating: 4.95,
    reviewsCount: 52,
    description:
      "Fabricado en madera de haya pulida con mango ergonómico. Sus cerdas metálicas de puntas redondeadas desenredan sin rayar la piel sensible, estimulando los folículos pilosos.",
    benefits: [
      "Ergonomía perfecta que no cansa la muñeca",
      "Retira pelo muerto sin romper el pelaje sano",
      "Durabilidad para toda la vida",
    ],
    howToUse:
      "Cepilla en dirección del crecimiento del pelo con pasadas largas y firmes pero suaves.",
    inStock: true,
  },

  // ─── FRAGANCIAS & ACCESORIOS ───
  {
    id: "prod-colonia-refrescante",
    name: "Colonia Canina Esencia Refrescante",
    subtitle: "Elegancia sutil en botella de vidrio con atomizador dorado",
    category: "fragrance",
    price: 19,
    image: "/assets/prod-colonia.png",
    badge: "SIN ALCOHOL",
    rating: 4.9,
    reviewsCount: 58,
    volume: "100 ml / 3.4 fl oz",
    description:
      "Fragancia exclusiva SOUVA diseñada por perfumistas para respetar el sensible olfato del perro. Notas limpias de lino, eucalipto dulce y brisa floral.",
    ingredients: [
      "Base acuosa desmineralizada (sin alcohol ni etanol)",
      "Extracto botánico aromatizante",
      "Glicerina vegetal hidratante",
    ],
    benefits: [
      "No estornuda ni molesta el olfato del perro",
      "Fija un aroma limpio y acogedor hasta por 7 días",
    ],
    howToUse:
      "Aplica 2 o 3 pulverizaciones sobre el lomo a 25 cm de distancia evitando cabeza y mucosas.",
    inStock: true,
  },
  {
    id: "prod-collar-placa",
    name: "Collar SOUVA con Placa de Bronce",
    subtitle: "Cuero vegano verde oliva & herrajes grabados",
    category: "accessories",
    price: 28,
    image: "/assets/prod-collar.png",
    rating: 5.0,
    reviewsCount: 24,
    description:
      "Collar artesanal con ribete beige y medalla conmemorativa grabada con el emblema de SOUVA. Resistente al agua y ultra suave en el cuello.",
    benefits: [
      "Hebilla de aleación de zinc ultraligera y resistente",
      "Grabado láser personalizado disponible",
    ],
    howToUse: "Ajustable con 5 posiciones para contorno de cuello de 25 a 50 cm.",
    inStock: true,
  },
  {
    id: "prod-tazon-ceramico",
    name: "Comedero Cerámico SOUVA",
    subtitle: "Cerámica vitrificada mate verde bosque",
    category: "accessories",
    price: 24,
    image: "/assets/prod-tazon.png",
    rating: 4.9,
    reviewsCount: 16,
    description:
      "Plato pesado antideslizante de alta densidad. Previene el acné canino bacteriano de los platos plásticos y combina con cualquier decoración moderna.",
    benefits: [
      "Apto para lavavajillas y microondas",
      "No acumula olores ni bacterias",
      "Base antideslizante estable",
    ],
    howToUse: "Ideal para agua fresca o alimento seco/húmedo.",
    inStock: true,
  },
  {
    id: "prod-peluche-souva",
    name: "Juguete & Cojín de Felpa SOUVA",
    subtitle: "Tejido jacquard a cuadros con silueta bordada",
    category: "accessories",
    price: 16,
    image: "/assets/prod-peluche.png",
    rating: 4.85,
    reviewsCount: 14,
    description:
      "Peluche terapéutico anti-ansiedad con pito interno de tono suave y textura acariciable.",
    benefits: [
      "Costuras reforzadas dobles",
      "Lavable a máquina en ciclo suave",
    ],
    howToUse: "Perfecto para acompañar a tu perro durante su siesta o relajación.",
    inStock: true,
  },
  {
    id: "prod-hueso-gourmet",
    name: "Hueso Masticable Gourmet SOUVA",
    subtitle: "Snack natural deshidratado para limpieza dental",
    category: "accessories",
    price: 8,
    image: "/assets/prod-hueso.png",
    rating: 5.0,
    reviewsCount: 33,
    description:
      "Premio 100% natural libre de conservantes químicos. Ayuda a retirar el sarro mecánico durante la masticación.",
    benefits: [
      "Monoproteico y fácil de digerir",
      "Entretiene a tu perro por más de 45 minutos",
    ],
    howToUse: "Ofrecer como premio especial de relajación post-baño.",
    inStock: true,
  },
];
