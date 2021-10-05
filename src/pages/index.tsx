import type { NextPage } from "next";
import Head from "next/head";
import Router from "next/router";
import styles from "./home.module.scss";
const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Home | Coding In...</title>
      </Head>
      <main className={styles.contentContainer}>
        <section className={styles.contentSection}>
          <span> 🙋 Bem Vindo!</span>
          <h1>
            Encontre artigos de projetos codificados em seu framework favorito!
          </h1>
          <div>
            <h2>No CodingIn,</h2>
            <p>
              tem projeto: <span>React, Next, Angular, Vue, etc...</span>
            </p>
          </div>
          <button onClick={() => Router.push("/posts")}>Posts</button>
        </section>
        <img src="./lab.svg" alt="img_home" />
      </main>
    </>
  );
};

export default Home;
