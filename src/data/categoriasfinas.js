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
      { name: "Restaurante" },
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
  },
  {
    name: "Vivienda",
    icon: <Entypo name="home" size={20} color="white" />,
    color: "#fba716",
    subcategorias: [
      { name: "Alquiler" },
      { name: "Hipoteca" },
      { name: "Reparaciones" },
      { name: "Seguro" },
      { name: "Servicios" },
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
      { name: "Taxi" },
      { name: "Autobus" },
      { name: "Tren" },
      { name: "Avion" },
    ],
  },
  {
    name: "Vehiculo",
    icon: <FontAwesome5 name="car" size={20} color="white" />,
    color: "#10b981",
    subcategorias: [
      { name: "Gasolina" },
      { name: "Estacionamiento" },
      { name: "Mantenimiento" },
      { name: "Seguro" },
    ],
  },
  {
    name: "Compras",
    icon: <AntDesign name="shopping" size={20} color="white" />,
    color: "#fa51a6",
    subcategorias: [
      { name: "Ropa" },
      { name: "Accesorios" },
      { name: "Papeleria" },
      { name: "Herramientas" },
      { name: "Tecnologia" },
      { name: "Farmacia" },
    ],
  },
  {
    name: "Entretenimiento",
    icon: <Ionicons name="game-controller" size={20} color="white" />,
    color: "#3344f8",
    subcategorias: [
      { name: "Eventos" },
      { name: "Libros" },
      { name: "Juegos" },
      { name: "Pasatiempo" },
      { name: "Streaming" },
      { name: "Viajes" },
    ],
  },
  {
    name: "Salud",
    icon: <MaterialIcons name="health-and-safety" size={20} color="white" />,
    color: "#34c9e4",
    subcategorias: [{ name: "Medicamentos" }, { name: "Seguro" }],
  },
  {
    name: "Educación",
    icon: <FontAwesome5 name="university" size={20} color="white" />,
    color: "#f6a45c",
    subcategorias: [
      { name: "Universidad" },
      { name: "Instituto" },
      { name: "Cursos" },
    ],
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
