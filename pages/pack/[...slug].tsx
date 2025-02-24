import { useState, useMemo } from "react";
import { GetServerSidePropsContext } from "next";
import Image from "next/image";
import Head from "next/head";
import {
  Pane,
  Heading,
  Text,
  Switch,
  majorScale,
  useTheme,
} from "evergreen-ui";
import Logo from "../../public/packstack_logo_horizontal_blue_sm.png";
import { PackData } from "../../types/pack";
import { CategoryTable } from "../../components/CategoryTable";
import { UnitSelector } from "../../components/UnitSelector";
import { Sidebar } from "../../components/Sidebar";
import { useCategoryItems } from "../../components/useCategoryItems";
import { UnitSystem } from "../../types/enums";
import { categoryColors } from "../../styles/categoryColors";
import styles from "../../styles/PackView.module.scss";

function PackView({ pack, categories }: PackData) {
  const theme: any = useTheme();
  const [compact, setCompact] = useState(false);
  const [unit, setUnit] = useState<UnitSystem>(UnitSystem.METRIC);
  const categoryItems = useCategoryItems(unit, categories);

  const categoryStats = useMemo(() => {
    return categoryItems
      .map(
        (
          {
            id,
            category: { name },
            consumable,
            wornWeight,
            totalWeight,
            totalUnit,
          },
          i
        ) => ({
          id,
          name,
          consumable,
          wornWeight,
          totalWeight,
          totalUnit,
          color: categoryColors[i],
        })
      )
      .sort((a, b) => b.totalWeight - a.totalWeight);
  }, [categoryItems]);

  const metaDescription = pack.description
    ? pack.description.length > 160
      ? pack.description.substring(0, 157) + "..."
      : pack.description
    : `Packing list for ${pack.title}`;

  return (
    <>
      <Head>
        <title>{pack.title} - packing list | Packstack</title>
        <meta name="description" content={metaDescription} />
        <link rel="icon" href="/static/favicon.png" />
      </Head>
      <Pane className={styles.PageContainer}>
        <Pane flex={1}>
          <Pane className={styles.Header}>
            <Pane width={112}>
              <a href="https://packstack.io">
                <Image src={Logo} alt="Packstack logo" unoptimized />
              </a>
            </Pane>
            <a
              className={styles.SignUpBanner}
              href="https://app.packstack.io/register"
              rel="noreferrer"
              target="_blank"
            >
              Sign Up
            </a>
          </Pane>
          <Pane className={styles.ContentContainer}>
            <Heading size={800} is="h1">
              {pack.title}
            </Heading>
            <Pane>
              <Text>{pack.description}</Text>
            </Pane>
            <Pane
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              marginTop={majorScale(2)}
              marginBottom={majorScale(3)}
            >
              <Heading size={600}>Packing List</Heading>
              <Pane display="flex" alignItems="center">
                <Pane
                  display="inline-flex"
                  alignItems="center"
                  marginRight={16}
                >
                  <Switch
                    checked={compact}
                    onChange={(e) => setCompact(e.target.checked)}
                    marginRight={8}
                  />
                  <Text>Compact</Text>
                </Pane>
                <UnitSelector selected={unit} onChange={(v) => setUnit(v)} />
              </Pane>
            </Pane>
            <Pane>
              {categoryItems.map((category) => (
                <CategoryTable
                  key={category.id}
                  data={category}
                  compact={compact}
                />
              ))}
            </Pane>
          </Pane>
        </Pane>
        <Pane className={styles.Sidebar}>
          <Sidebar
            pack={pack}
            categoryStats={categoryStats}
            systemUnit={unit}
          />
        </Pane>
      </Pane>
    </>
  );
}

export async function getServerSideProps({
  params,
}: GetServerSidePropsContext) {
  const slug = params?.slug;
  if (!slug || !slug[0]) {
    // catches missing path param
    return {
      notFound: true,
    };
  }

  const id = slug[0];
  try {
    const res = await fetch(`${process.env.API_URL}/api/v1/pack/view/${id}`);
    const data = await res.json();

    return { props: data };
  } catch {
    // API request failed
    return {
      notFound: true,
    };
  }
}

export default PackView;
