import Challenges from "./components/challenges";
import Collections from "./components/collections";
import FreshBakes from "./components/freshBakes";
import Hero from "./components/hero";
import LatestTechnical from "./components/latestTechnical";
import styles from "./components/home.module.css";

export default function HomePage() {
  return (
    <div className={styles.page}>
      <Hero />
      <LatestTechnical />
      <FreshBakes />
      <Challenges />
      <Collections />
    </div>
  );
}
