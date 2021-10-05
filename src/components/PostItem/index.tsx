import styles from "./styles.module.scss";
type Tag = {
  id: string;
  name: string;
};

type PostProps = {
  data: {
    id: string;
    title: string;
    autor: string;
    autorAvatar: string;
    created: string;
    paragraphOne: string;
    tags?: Tag[];
    blocks: [];
  };
};

export default function PostItem({ data }: PostProps) {
  //const title = data.blocks.find((block: any) => block.type === "heading_1");
  return (
    <div className={styles.postContainer}>
      <span>
        <img alt="avatar" src={data.autorAvatar} />
        {data.autor}
      </span>
      <h1>{data.title}</h1>
      <p>{data.paragraphOne}</p>
      <div className={styles.postInfo}>
        <span>criado: {data.created}</span>
        {data.tags?.map((tag) => (
          <span key={tag.id}>{tag.name}</span>
        ))}
      </div>
    </div>
  );
}
