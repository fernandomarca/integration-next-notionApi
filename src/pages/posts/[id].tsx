import { Client } from "@notionhq/client";
import { GetServerSideProps } from "next";
import styles from "./post.module.scss";

type User = {
  id: string;
  autor: string;
  avatar: string;
  lastEdited: string;
};

type Block = {
  id?: string;
  imgUrl?: string;
  type: string;
  text: string[];
  checked?: boolean;
};

type PostProps = {
  data: Block[];
  user: User;
};

export default function Post({ data, user }: PostProps) {
  let numberedListItems: Block[] = [];
  let bulletedListItems: Block[] = [];

  function isLastNumberedListItem() {
    return (
      <ol>
        {numberedListItems.map((item) => (
          <li key={item.id}>{item.text}</li>
        ))}
      </ol>
    );
  }
  function isLastBulletedListItem() {
    return (
      <ul>
        {bulletedListItems.map((item) => (
          <li key={item.id}>{item.text}</li>
        ))}
      </ul>
    );
  }

  const heading_1 = data.find((block) => block.type === "heading_1");
  return (
    <main className={styles.container}>
      <article className={styles.post}>
        <h1 key={heading_1?.id}>{heading_1?.text}</h1>
        <div className={styles.postInfo}>
          <span>
            <img alt="avatar" src={user.avatar} />
            {user.autor} -
          </span>
          <span>atualizado: {user.lastEdited} </span>
        </div>
        {data.map((block, index) => {
          if (block.type === "paragraph") {
            return <p key={block.id}>{block.text}</p>;
          }
          if (block.type === "code") {
            return (
              <div key={block.id} className={styles.blockTypeCode}>
                <p>{block.text}</p>
              </div>
            );
          }
          if (block.type === "numbered_list_item") {
            numberedListItems.push(block);
            if (data[index + 1].type !== "numbered_list_item") {
              const renderLista = isLastNumberedListItem();
              numberedListItems = [];
              return renderLista;
            }
          }
          if (block.type === "bulleted_list_item") {
            bulletedListItems.push(block);
            if (data[index + 1].type !== "bulletedListItems") {
              const renderBulletedList = isLastBulletedListItem();
              bulletedListItems = [];
              return renderBulletedList;
            }
          }
          if (block.type === "to_do") {
            return (
              <label key={block.id}>
                <input type="checkbox" checked={block.checked} readOnly />
                <span>{block.text}</span>
              </label>
            );
          }
          if (block.type === "image") {
            return (
              <div className={styles.img}>
                <img key={block.id} src={block.imgUrl} />
              </div>
            );
          }
        })}
      </article>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { id } = query;
  const notion = new Client({
    auth: process.env.NOTION_SECRET,
  });

  const page: any = await notion.pages.retrieve({
    page_id: id as string,
    auth: process.env.NOTION_SECRET,
  });

  const lastEdited = new Date(page.last_edited_time).toLocaleDateString(
    "pt-BR",
    {
      day: "2-digit",
      month: "short",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }
  );

  const user = {
    id: page.properties.autor.created_by.id,
    autor: page.properties.autor.created_by.name,
    avatar: page.properties.autor.created_by.avatar_url,
    lastEdited,
  };

  const postBlocks = await notion.blocks.children.list({
    block_id: id as string,
  });

  const postBlocksFormatted = postBlocks.results.map((block: any) => {
    if (block.type === "heading_1") {
      return {
        id: block.id,
        type: "heading_1",
        text: block.heading_1.text[0].plain_text,
      };
    }

    if (block.type === "paragraph") {
      return {
        id: block.id,
        type: "paragraph",
        text: block.paragraph.text.map((text: any) => text.plain_text),
      };
    }

    if (block.type === "numbered_list_item") {
      return {
        id: block.id,
        type: "numbered_list_item",
        text: block.numbered_list_item.text.map(
          (text: any) => text.text.content
        ),
      };
    }

    if (block.type === "bulleted_list_item") {
      return {
        id: block.id,
        type: "bulleted_list_item",
        text: block.bulleted_list_item.text.map(
          (text: any) => text.text.content
        ),
      };
    }

    if (block.type === "code") {
      return {
        id: block.id,
        type: "code",
        language: block.code.language,
        text: block.code.text.map((text: any) => text.plain_text),
      };
    }

    if (block.type === "image") {
      return {
        id: block.id,
        type: "image",
        imgUrl: block.image.external.url,
      };
    }

    if (block.type === "to_do") {
      return {
        id: block.id,
        type: "to_do",
        text: block.to_do.text[0].plain_text,
        checked: block.to_do.checked,
      };
    }
    return {};
  });
  return {
    props: {
      data: postBlocksFormatted,
      user,
    },
  };
};
