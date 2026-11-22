const BRAND_CATALOGS = {
  einhell: {
    name: "Einhell",
    tagline: "Tecnología alemana Power X-Change: una batería para más de 300 herramientas sin cables.",
    accent: "#e30613",
    logo: "./assets/brand-einhell-3d.png",
    products: [
      {
        code: "EIN-TE-CD-18",
        name: "Taladro Atornillador Percutor Einhell TE-CD 18/40 Li",
        category: "Power X-Change 18V",
        price: 119990,
        spec: "40 Nm · 2 velocidades · Incluye 2 baterías 2.0 Ah + cargador",
        description: "Taladro percutor inalámbrico compacto con mandril metálico de 13 mm, luz LED integrada y maletín de transporte.",
      },
      {
        code: "EIN-TE-AG-18",
        name: "Esmeril Angular Inalámbrico Einhell TE-AG 18/115 Li",
        category: "Corte y Desbaste",
        price: 89990,
        spec: "115 mm (4-1/2\") · 8.500 RPM · Arranque suave",
        description: "Esmeril angular liviano con carcasa de aluminio robusta y protección de re-arranque.",
      },
      {
        code: "EIN-TE-RH-38",
        name: "Rotomartillo SDS-Plus Einhell TE-RH 32 4F",
        category: "Construcción Pesada",
        price: 169990,
        spec: "1.250 W · 5 Joules · 4 funciones + maletín E-Box",
        description: "Rotomartillo profesional antivibración para perforación en hormigón armado y cincelado.",
      },
      {
        code: "EIN-TE-CS-18",
        name: "Sierra Circular Inalámbrica Einhell TE-CS 18/165 Li",
        category: "Carpintería",
        price: 114990,
        spec: "Disco 165 mm · Corte hasta 54 mm a 90° · Guía paralela",
        description: "Sierra circular compacta con ajuste sin herramientas de profundidad e inclinación.",
      },
      {
        code: "EIN-TC-AC-24",
        name: "Compresor de Aire Einhell TC-AC 190/24/8",
        category: "Neumática",
        price: 149990,
        spec: "1.500 W (2 HP) · Estanque 24 L · 8 bar máx.",
        description: "Compresor lubricado con regulador de presión, manómetro dual y ruedas de transporte.",
      },
      {
        code: "EIN-PXC-KIT",
        name: "Kit Inicio Power X-Change Batería 4.0 Ah + Cargador Rápido",
        category: "Baterías y Energía",
        price: 59990,
        spec: "18V Li-Ion · Indicador LED 3 niveles · Carga rápida 75 min",
        description: "Sistema de gestión activa ABS compatible con toda la familia Einhell Power X-Change.",
      },
    ],
  },
  stanley: {
    name: "STANLEY",
    tagline: "Herramientas manuales y eléctricas de precisión diseñadas para obra gruesa, carpintería y taller.",
    accent: "#f5c400",
    logo: "./assets/brand-stanley-3d.png",
    products: [
      {
        code: "STN-STHT30624",
        name: "Huincha de Medir STANLEY FatMax 8 m × 32 mm",
        category: "Medición",
        price: 22990,
        spec: "8 metros · Cinta BladeArmor · Alcance sin doblarse 3.3 m",
        description: "Carcasa bimaterial resistente a impactos con gancho remachado de 3 puntos.",
      },
      {
        code: "STN-STHT51391",
        name: "Martillo Carpintero STANLEY Fibra de Vidrio 16 oz",
        category: "Herramientas Manuales",
        price: 16990,
        spec: "Cabeza forjada 450 g · Mango ergonómico antivibración",
        description: "Acero de alto carbono templado con unión epóxica de alta resistencia.",
      },
      {
        code: "STN-STMT74179",
        name: "Set Llaves Combinadas Métricas STANLEY 14 Piezas",
        category: "Mecánica",
        price: 54990,
        spec: "8 mm a 24 mm · Acero Cromo Vanadio · Sistema Maxi-Drive",
        description: "Acabado cromado anticorrosión con estuche organizador de lona reforzada.",
      },
      {
        code: "STN-STHT43103",
        name: "Nivel Torpedo Magnético STANLEY FatMax 23 cm",
        category: "Nivelación",
        price: 18990,
        spec: "Aluminio fundido · 3 burbujas · Base magnética V-Groove",
        description: "Ideal para montaje de perfiles metálicos, tuberías y carpintería de precisión.",
      },
      {
        code: "STN-SCD700C2K",
        name: "Taladro Percutor Inalámbrico STANLEY V20 20V",
        category: "Herramientas Eléctricas",
        price: 139990,
        spec: "50 Nm · 2 baterías 1.5 Ah + cargador + maleta",
        description: "Batería V20 sin efecto memoria y motor de alto rendimiento para madera, metal y albañilería.",
      },
      {
        code: "STN-STST19331",
        name: "Caja de Herramientas STANLEY 19\" Cierres Metálicos",
        category: "Almacenamiento",
        price: 29990,
        spec: "48 cm · Bandeja extraíble · Organizadores superiores",
        description: "Polipropileno de alto impacto con pestillos metálicos inoxidables y ranura para candado.",
      },
    ],
  },
  dewalt: {
    name: "DEWALT",
    tagline: "Rendimiento Guaranteed Tough® con tecnología Brushless XR para profesionales exigentes.",
    accent: "#febd17",
    logo: "./assets/brand-dewalt-3d.png",
    products: [
      {
        code: "DWT-DCD796D2",
        name: "Taladro Percutor Brushless DEWALT 20V MAX XR",
        category: "20V MAX XR",
        price: 229990,
        spec: "70 Nm · Motor sin carbones · 2 baterías 2.0 Ah + maleta TSTAK",
        description: "Transmisión metálica de 2 velocidades y mandril de trinquete de 13 mm para uso intensivo.",
      },
      {
        code: "DWT-DCF887D2",
        name: "Atornillador de Impacto DEWALT 20V XR 3 Velocidades",
        category: "20V MAX XR",
        price: 214990,
        spec: "205 Nm · PrecisionDrive · Encastre hexagonal 1/4\"",
        description: "Torque extremo en cuerpo ultracompacto de 134 mm con triple anillo LED.",
      },
      {
        code: "DWT-DCG413B",
        name: "Esmeril Angular Brushless DEWALT 20V XR 4-1/2\"",
        category: "Corte y Desbaste",
        price: 189990,
        spec: "9.000 RPM · Freno electrónico Kickback Brake",
        description: "Detiene el disco en menos de 2 segundos al soltar el gatillo o detectar atasco.",
      },
      {
        code: "DWT-DCH273B",
        name: "Rotomartillo SDS-Plus Brushless DEWALT 20V XR",
        category: "Construcción",
        price: 279990,
        spec: "2.1 Joules · Sistema SHOCKS antivibración · 3 modos",
        description: "Perforación ultrarrápida en hormigón con mínima fatiga del operador.",
      },
      {
        code: "DWT-DCS570B",
        name: "Sierra Circular Brushless DEWALT 20V XR 7-1/4\"",
        category: "Carpintería",
        price: 219990,
        spec: "Disco 184 mm · 5.500 RPM · Corte 65 mm a 90°",
        description: "Zapata de aluminio de alta precisión con freno eléctrico y soplador de polvo.",
      },
      {
        code: "DWT-DWST17807",
        name: "Caja Modular DEWALT TSTAK II Tapa Plana",
        category: "Almacenamiento",
        price: 44990,
        spec: "Capacidad 30 kg · Pestillos metálicos apilables",
        description: "Sistema modular con sello IP54 y espuma personalizable para herramientas XR.",
      },
    ],
  },
};

function formatClp(val) {
  return "$" + val.toLocaleString("es-CL");
}

function renderBrandPage() {
  const brandKey = document.body.dataset.brand;
  const brand = BRAND_CATALOGS[brandKey];
  const grid = document.getElementById("brand-product-grid");
  if (!brand || !grid) return;

  grid.innerHTML = brand.products
    .map((item) => {
      const msg = encodeURIComponent(
        `Hola Poseck Ferreterías, me interesa cotizar: ${item.name} (Código: ${item.code}) — ${formatClp(item.price)}`,
      );
      return `
        <article class="brand-product-card">
          <div class="brand-card-top">
            <span class="brand-card-cat">${item.category}</span>
            <span class="brand-card-sku">${item.code}</span>
          </div>
          <h3>${item.name}</h3>
          <p class="brand-card-spec">${item.spec}</p>
          <p class="brand-card-desc">${item.description}</p>
          <div class="brand-card-footer">
            <div>
              <small>Precio ref. IVA incl.</small>
              <strong>${formatClp(item.price)}</strong>
            </div>
            <a
              class="brand-quote-btn"
              href="https://wa.me/56953326406?text=${msg}"
              target="_blank"
              rel="noopener noreferrer"
            >
              Cotizar
            </a>
          </div>
        </article>
      `;
    })
    .join("");
}

document.addEventListener("DOMContentLoaded", renderBrandPage);
