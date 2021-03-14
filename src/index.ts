import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import mikroConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";

const main = async () => {
  const orm = await MikroORM.init(mikroConfig);
  await orm.getMigrator().up();

  orm.em.nativeDelete(Post,{})
  const post = orm.em.create(Post, {title: "กินข้าวอร่อยจังเลย1"})
  await orm.em.persistAndFlush(post);
  const post2 = orm.em.create(Post, {title: "กินข้าวอร่อยจังเลย1"})
  await orm.em.persistAndFlush(post2);

  const posts = await orm.em.find(Post, {})
  console.log(posts);

  const app = express();
  const apolloServer = new ApolloServer({
      schema: await buildSchema({
          resolvers: [HelloResolver, PostResolver],
          validate: false
      }),
      context: () => ({em: orm.em})
  })

  apolloServer.applyMiddleware({app})

  app.get("/", (_, res) => {
    res.send("hello");
  });
  app.listen(4000, () => {
    console.log("server started on localhost:4000");
  });
};

main().catch((err) => {
  console.error(err);
});
