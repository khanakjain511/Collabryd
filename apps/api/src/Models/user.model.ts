  import { db, users } from "@collabryd/database";

export default async function (){  try {
    const result = await db.select().from(users);
    return result
  } catch (error) {
    console.log(error);
}}