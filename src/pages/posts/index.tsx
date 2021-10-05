import { Client } from "@notionhq/client";
import { GetStaticProps } from "next";
import PostItem from "../../components/PostItem";
import styles from "./styles.module.scss";

type Tag = {
  id: string;
  name: string;
};

type Post = {
  id: string;
  title: string;
  autor: string;
  autorAvatar: string;
  created: string;
  paragraphOne: string;
  tags?: Tag[];
  blocks: [];
};

type PostsProps = {
  posts: Post[];
};

function Posts({ posts }: PostsProps) {
  return (
    <main className={styles.pagePostContainer}>
      <h1>Coding In.</h1>
      <h2>aqui estão seus últimos artigos!</h2>
      <div className={styles.divider}></div>

      {posts ? (
        posts.map((post) => {
          return (
            <div key={post.id}>
              <a key={post.id} href={`/posts/${post.id}`}>
                <PostItem data={post} />
              </a>
            </div>
          );
        })
      ) : (
        <p>carregando...</p>
      )}
    </main>
  );
}

export const getStaticProps: GetStaticProps = async ({}) => {
  const notion = new Client({
    auth: process.env.NOTION_SECRET,
  });

  const data = await notion.databases.query({
    database_id: process.env.DATABASE_ID as string,
  });

  const posts = await Promise.all(
    data.results.map(async (item: any) => {
      const blocks = await notion.blocks.children.list({
        block_id: item.id,
      });
      const paragraphs: any = blocks.results.find(
        (block: any) => block.type === "paragraph"
      );
      const paragraphOne = paragraphs?.paragraph.text.map(
        (element: any) => element.plain_text
      );

      const created = new Date(item.created_time).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      const title: any = blocks.results.find(
        (block: any) => block.type === "heading_1"
      );

      return {
        id: item.id,
        title: title?.heading_1.text[0].plain_text,
        autor: item.properties.autor.created_by.name,
        autorAvatar: item.properties.autor.created_by.avatar_url,
        created,
        paragraphOne,
        blocks: blocks.results,
        tags: item.properties.Tags.multi_select,
      };
    })
  );

  return {
    props: { posts, data: data.results },
  };
};

export default Posts;
