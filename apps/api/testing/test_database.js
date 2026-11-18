import { db, users } from "@collabryd/database";
const [user] = await db
    .insert(users)
    .values({
    username: "shreyansh",
    email: "shreyansh@example.com",
    fullName: "Shreyansh Agrawal",
})
    .returning();
console.log(user);
