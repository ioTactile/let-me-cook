import { Unit } from "@/types/enums";

export const translateUnit = (unit: Unit) => {
  switch (unit) {
    case Unit.GRAM:
      return "g";
    case Unit.KILOGRAM:
      return "kg";
    case Unit.LITER:
      return "L";
    case Unit.MILLILITER:
      return "mL";
    case Unit.PIECE:
      return "pièce";
    case Unit.PACK:
      return "paquet";
    case Unit.BOTTLE:
      return "bouteille";
    case Unit.BOX:
      return "boîte";
    case Unit.BAG:
      return "sachet";
    case Unit.CAN:
      return "boîte de conserve";
    case Unit.JAR:
      return "pot";
    case Unit.BUNCH:
      return "botte";
    case Unit.HEAD:
      return "tête";
    case Unit.CLOVE:
      return "gousse";
    case Unit.LEAF:
      return "feuille";
    case Unit.SLICE:
      return "tranche";
    case Unit.CUP:
      return "tassecup";
    case Unit.TABLESPOON:
      return "cuillère à soupe";
    case Unit.TEASPOON:
      return "cuillère à café";
    case Unit.PINCH:
      return "pincée";
    case Unit.DASH:
      return "filet";
    default:
      return unit;
  }
};
