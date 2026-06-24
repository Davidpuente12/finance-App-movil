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
    name: "Restaurante",
    icon: <MaterialCommunityIcons name="hamburger" size={20} color="black" />,
    color: "#f16262",
  },
  {
    name: "Supermercado",
    icon: <FontAwesome name="shopping-cart" size={20} color="black" />,
    color: "#ef4444",
  },
  {
    name: "Vivienda",
    icon: <Entypo name="home" size={20} color="black" />,
    color: "#ffac1c",
  },
  {
    name: "Servicios",
    icon: <MaterialIcons name="electrical-services" size={20} color="black" />,
    color: "#e7ab42",
  },
  {
    name: "Internet",
    icon: <FontAwesome name="wifi" size={20} color="black" />,
    color: "#3b82f6",
  },
  {
    name: "Transporte",
    icon: <MaterialIcons name="directions-bus" size={20} color="black" />,
    color: "#34c9e4",
  },
  {
    name: "Vehiculo",
    icon: <FontAwesome5 name="car" size={20} color="black" />,
    color: "#34c9e4",
  },
  {
    name: "Compras",
    icon: <AntDesign name="shopping" size={20} color="black" />,
    color: "#fa51a6",
  },
  {
    name: "Entretenimiento",
    icon: <Ionicons name="game-controller" size={20} color="black" />,
    color: "#fa51a6",
  },
  {
    name: "Salud",
    icon: <MaterialIcons name="health-and-safety" size={20} color="black" />,
    color: "#10b981",
  },
  {
    name: "Educación",
    icon: <FontAwesome5 name="university" size={20} color="black" />,
    color: "#8b5cf6",
  },
  {
    name: "Inversiones",
    icon: <AntDesign name="rise" size={20} color="black" />,
    color: "#84cc16",
  },
  {
    name: "Otros",
    icon: <Entypo name="wallet" size={20} color="black" />,
    color: "#6b7280",
  },
];

const categorias_ingresos = [
  {
    name: "Salario",
    icon: <Fontisto name="dinners-club" size={15} color="black" />,
    color: "#d9c71f",
  },
  {
    name: "Inversiones",
    icon: <AntDesign name="rise" size={20} color="black" />,
    color: "#84cc16",
  },
  {
    name: "Otros",
    icon: <Entypo name="wallet" size={20} color="black" />,
    color: "#06b6d4",
  },
];

export { categorias_gastos, categorias_ingresos };
