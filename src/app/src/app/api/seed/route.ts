import { Index } from '@upstash/vector';
import { NextResponse } from 'next/server';

const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

const foodData = [
  { id: '1', text: 'Mango is a tropical fruit that is sweet and juicy. It grows in warm climates.' },
  { id: '2', text: 'Pineapple is a tropical fruit with a spiky exterior and sweet tangy flavor.' },
  { id: '3', text: 'Papaya is a tropical fruit rich in vitamin C and has orange flesh.' },
  { id: '4', text: 'Banana is a tropical fruit that is soft, sweet and rich in potassium.' },
  { id: '5', text: 'Coconut is a tropical fruit with white flesh and coconut water inside.' },
  { id: '6', text: 'Chili peppers are spicy foods that contain capsaicin, making them hot.' },
  { id: '7', text: 'Jalapeño is a medium-sized spicy pepper used in Mexican cuisine.' },
  { id: '8', text: 'Habanero is one of the hottest chili peppers with a fruity flavor.' },
  { id: '9', text: 'Wasabi is an extremely spicy Japanese condiment served with sushi.' },
  { id: '10', text: 'Sriracha is a spicy hot sauce made from chili peppers, vinegar and garlic.' },
  { id: '11', text: 'Honey is a sweet food made by bees from flower nectar.' },
  { id: '12', text: 'Chocolate is a sweet food made from cocoa beans, loved worldwide.' },
  { id: '13', text: 'Strawberry is a sweet red fruit often used in desserts and smoothies.' },
  { id: '14', text: 'Watermelon is a sweet summer fruit with red flesh and green rind.' },
  { id: '15', text: 'Maple syrup is a sweet liquid made from maple tree sap.' },
];

export async function GET() {
  try {
    await index.upsert(
      foodData.map((item) => ({
        id: item.id,
        data: item.text,
        metadata: { text: item.text },
      }))
    );
    return NextResponse.json({ success: true, count: foodData.length });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
