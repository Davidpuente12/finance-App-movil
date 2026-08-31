import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";

import Fontisto from "@expo/vector-icons/Fontisto";

const categorias_gastos = [
  {
    name: "Comida",
    icon: <MaterialCommunityIcons name="hamburger" size={20} color="white" />,
    color: "#ef4444",
    subcategorias: [
      {
        name: "Restaurante",
        icon: (
          <MaterialCommunityIcons
            name="silverware-fork-knife"
            size={20}
            color="white"
          />
        ),
      },
      {
        name: "Panaderia",
        icon: (
          <MaterialCommunityIcons
            name="food-croissant"
            size={20}
            color="white"
          />
        ),
      },
    ],
  },
  {
    name: "Supermercado",
    icon: <FontAwesome name="shopping-cart" size={20} color="white" />,
    color: "#f16262",
    subcategorias: [
      {
        name: "Víveres",
        icon: (
          <MaterialCommunityIcons name="basket-fill" size={20} color="white" />
        ),
      },
      {
        name: "Frutas y Hortalizas",
        icon: (
          <MaterialCommunityIcons name="food-apple" size={20} color="white" />
        ),
      },
      {
        name: "Charcutería",
        icon: (
          <MaterialCommunityIcons
            name="food-drumstick"
            size={20}
            color="white"
          />
        ),
      },
      {
        name: "Productos de limpieza",
        icon: (
          <MaterialCommunityIcons name="spray-bottle" size={20} color="white" />
        ),
      },
    ],
  },
  {
    name: "Vivienda",
    icon: <Entypo name="home" size={20} color="white" />,
    color: "#fba716",
    subcategorias: [
      {
        name: "Alquiler",
        icon: (
          <MaterialCommunityIcons name="key-variant" size={20} color="white" />
        ),
      },
      {
        name: "Hipoteca",
        icon: <MaterialCommunityIcons name="bank" size={20} color="white" />,
      },
      {
        name: "Reparaciones",
        icon: <MaterialCommunityIcons name="tools" size={20} color="white" />,
      },
      {
        name: "Seguro",
        icon: (
          <MaterialCommunityIcons name="shield-check" size={20} color="white" />
        ),
      },
      {
        name: "Servicios",
        icon: (
          <MaterialCommunityIcons
            name="home-lightning-bolt"
            size={20}
            color="white"
          />
        ),
      },
    ],
  },
  {
    name: "Servicios",
    icon: <MaterialIcons name="electrical-services" size={20} color="white" />,
    color: "#e2ad50",
  },
  {
    name: "Internet",
    icon: <FontAwesome name="wifi" size={20} color="white" />,
    color: "#3b82f6",
  },
  {
    name: "Transporte",
    icon: <MaterialIcons name="directions-bus" size={20} color="white" />,
    color: "#707475",
    subcategorias: [
      {
        name: "Taxi",
        icon: <MaterialCommunityIcons name="taxi" size={20} color="white" />,
      },
      {
        name: "Autobus",
        icon: <MaterialCommunityIcons name="bus" size={20} color="white" />,
      },
      {
        name: "Tren",
        icon: <MaterialCommunityIcons name="train" size={20} color="white" />,
      },
      {
        name: "Avion",
        icon: (
          <MaterialCommunityIcons name="airplane" size={20} color="white" />
        ),
      },
    ],
  },
  {
    name: "Vehiculo",
    icon: <FontAwesome5 name="car" size={20} color="white" />,
    color: "#10b981",
    subcategorias: [
      {
        name: "Gasolina",
        icon: (
          <MaterialCommunityIcons name="gas-station" size={20} color="white" />
        ),
      },
      {
        name: "Estacionamiento",
        icon: <MaterialCommunityIcons name="parking" size={20} color="white" />,
      },
      {
        name: "Mantenimiento",
        icon: (
          <MaterialCommunityIcons name="car-wrench" size={20} color="white" />
        ),
      },
      {
        name: "Seguro",
        icon: (
          <MaterialCommunityIcons name="shield-car" size={20} color="white" />
        ),
      },
    ],
  },
  {
    name: "Compras",
    icon: <AntDesign name="shopping" size={20} color="white" />,
    color: "#fa51a6",
    subcategorias: [
      {
        name: "Ropa",
        icon: (
          <MaterialCommunityIcons name="tshirt-crew" size={20} color="white" />
        ),
      },
      {
        name: "Accesorios",
        icon: (
          <MaterialCommunityIcons
            name="watch-variant"
            size={20}
            color="white"
          />
        ),
      },
      {
        name: "Papeleria",
        icon: (
          <MaterialCommunityIcons
            name="notebook-outline"
            size={20}
            color="white"
          />
        ),
      },
      {
        name: "Herramientas",
        icon: (
          <MaterialCommunityIcons
            name="hammer-wrench"
            size={20}
            color="white"
          />
        ),
      },
      {
        name: "Tecnologia",
        icon: <MaterialCommunityIcons name="laptop" size={20} color="white" />,
      },
      {
        name: "Farmacia",
        icon: <MaterialCommunityIcons name="pill" size={20} color="white" />,
      },
    ],
  },
  {
    name: "Cuidado personal",
    icon: (
      <MaterialCommunityIcons
        name="face-woman-shimmer"
        size={20}
        color="white"
      />
    ),
    color: "#ec4899",
    subcategorias: [
      {
        name: "Peluquería",
        icon: (
          <MaterialCommunityIcons name="content-cut" size={20} color="white" />
        ),
      },
      {
        name: "Spa",
        icon: <MaterialCommunityIcons name="spa" size={20} color="white" />,
      },
      {
        name: "Cosméticos",
        icon: (
          <MaterialCommunityIcons name="lipstick" size={20} color="white" />
        ),
      },
      {
        name: "Productos de belleza",
        icon: (
          <MaterialCommunityIcons
            name="bottle-tonic-plus"
            size={20}
            color="white"
          />
        ),
      },
    ],
  },
  {
    name: "Entretenimiento",
    icon: <Ionicons name="game-controller" size={20} color="white" />,
    color: "#3344f8",
    subcategorias: [
      {
        name: "Eventos",
        icon: (
          <MaterialCommunityIcons
            name="calendar-star"
            size={20}
            color="white"
          />
        ),
      },
      {
        name: "Libros",
        icon: (
          <MaterialCommunityIcons
            name="book-open-page-variant"
            size={20}
            color="white"
          />
        ),
      },
      {
        name: "Juegos",
        icon: (
          <MaterialCommunityIcons
            name="gamepad-variant"
            size={20}
            color="white"
          />
        ),
      },
      {
        name: "Pasatiempo",
        icon: (
          <MaterialCommunityIcons
            name="palette-outline"
            size={20}
            color="white"
          />
        ),
      },
      {
        name: "Streaming",
        icon: (
          <MaterialCommunityIcons
            name="play-circle-outline"
            size={20}
            color="white"
          />
        ),
      },
      {
        name: "Viajes",
        icon: (
          <MaterialCommunityIcons name="bag-suitcase" size={20} color="white" />
        ),
      },
    ],
  },
  {
    name: "Salud",
    icon: <MaterialIcons name="health-and-safety" size={20} color="white" />,
    color: "#34c9e4",
    subcategorias: [
      {
        name: "Medicamentos",
        icon: (
          <MaterialCommunityIcons name="medical-bag" size={20} color="white" />
        ),
      },
      {
        name: "Seguro",
        icon: (
          <MaterialCommunityIcons name="shield-check" size={20} color="white" />
        ),
      },
    ],
  },
  {
    name: "Educación",
    icon: <FontAwesome5 name="university" size={20} color="white" />,
    color: "#f6a45c",
    subcategorias: [
      {
        name: "Universidad",
        icon: <MaterialCommunityIcons name="school" size={20} color="white" />,
      },
      {
        name: "Instituto",
        icon: <MaterialCommunityIcons name="domain" size={20} color="white" />,
      },
      {
        name: "Cursos",
        icon: (
          <MaterialCommunityIcons
            name="book-education"
            size={20}
            color="white"
          />
        ),
      },
    ],
  },
  {
    name: "Asignacion familiar",
    icon: (
      <MaterialCommunityIcons name="account-cash" size={20} color="white" />
    ),
    color: "#22c55e",
  },
  {
    name: "Inversiones",
    icon: <AntDesign name="rise" size={20} color="white" />,
    color: "#84cc16",
  },

  {
    name: "Regalos",
    icon: <FontAwesome5 name="gift" size={20} color="white" />,
    color: "#8b5cf6",
  },
  {
    name: "Donaciones",
    icon: <MaterialCommunityIcons name="heart-plus" size={20} color="white" />,
    color: "#f43f5e",
  },
  {
    name: "Gastos financieros",
    icon: <MaterialCommunityIcons name="finance" size={20} color="white" />,
    color: "#f97316",
    subcategorias: [
      {
        name: "Impuestos",
        icon: (
          <MaterialCommunityIcons name="receipt-text" size={20} color="white" />
        ),
      },
      {
        name: "Multas",
        icon: <MaterialCommunityIcons name="gavel" size={20} color="white" />,
      },
      {
        name: "Prestamos",
        icon: (
          <MaterialCommunityIcons
            name="cash-multiple"
            size={20}
            color="white"
          />
        ),
      },
      {
        name: "Seguros",
        icon: (
          <MaterialCommunityIcons name="shield-check" size={20} color="white" />
        ),
      },
    ],
  },
  {
    name: "Otros",
    icon: <Entypo name="wallet" size={20} color="white" />,
    color: "#2498f2",
  },
];

const categorias_ingresos = [
  {
    name: "Salario",
    icon: <Fontisto name="dinners-club" size={15} color="white" />,
    color: "#d9c71f",
  },
  {
    name: "Inversiones",
    icon: <AntDesign name="rise" size={20} color="white" />,
    color: "#84cc16",
  },
  {
    name: "Otros",
    icon: <Entypo name="wallet" size={20} color="white" />,
    color: "#2498f2",
  },
];

export { categorias_gastos, categorias_ingresos };
