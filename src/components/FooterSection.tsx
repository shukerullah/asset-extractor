import Image from "next/image";
import styles from "./FooterSection.module.css";

export default function FooterSection() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerMessage}>
        <h3>Remove backgrounds from any image in seconds</h3>
        <p>
          Fast, reliable, and completely free. Extract objects, remove
          backgrounds, and download transparent PNGs with just a few clicks.
        </p>
      </div>

      <div className={styles.footerLinks}>
        <div className={styles.socialLinks}>
          <p>
            Follow me on Twitter:{" "}
            <a
              href="https://twitter.com/shukerullah"
              target="_blank"
              rel="noopener noreferrer"
            >
              @shukerullah
            </a>
          </p>
        </div>
        <div className={styles.githubLink}>
          <a
            href="https://github.com/shukerullah/asset-extractor"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.githubButton}
            aria-label="View source code on GitHub"
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="currentColor"
              className={styles.githubIcon}
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            ★ Star on GitHub
          </a>
        </div>
        <div className={styles.coffeeLink}>
          <a
            href="https://www.buymeacoffee.com/shukerullah"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png"
              alt="Buy Me A Coffee"
              width={200}
              height={55}
              sizes="200px"
              className={styles.coffeeButton}
            />
          </a>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p>Made with ❤️ for creators worldwide.</p>
      </div>
    </footer>
  );
}