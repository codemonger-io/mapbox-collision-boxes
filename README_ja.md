[English](./README.md) / 日本語

# Mapbox Collision Boxes

Mapboxマップ上の衝突ボックスを画面座標系で計算する、[Mapbox GL JS (`mapbox-gl`)](https://docs.mapbox.com/mapbox-gl-js/guides/)用のユーティリティライブラリです。

## はじめる

### 事前準備

このライブラリは`mapbox-gl`バージョン2.xおよび3.xと一緒に使用する想定です。
(3.13.0より新しいバージョンではテストしていません。)

### インストール方法

このレポジトリを依存関係に追加してください。

```sh
npm install https://github.com/codemonger-io/mapbox-collision-boxes#v0.3.0
```

#### GitHub Packagesからインストールする

`main`ブランチにコミットがプッシュされるたびに、*開発者用パッケージ*がGitHub Packagesが管理するnpmレジストリにパブリッシュされます。
*開発者用パッケージ*のバージョンは次のリリースバージョンにハイフン(`-`)と短いコミットハッシュつなげたものになります。例、`0.3.0-abc1234` (`abc1234`はパッケージをビルドするのに使ったコミット(*スナップショット*)の短いコミットハッシュ)。
*開発者用パッケージ*は[こちら](https://github.com/codemonger-io/mapbox-collision-boxes/pkgs/npm/mapbox-collision-boxes)にあります。

##### GitHubパーソナルアクセストークンの設定

*開発者用パッケージ*をインストールするには、最低限`read:packages`スコープの**クラシック**GitHubパーソナルアクセストークン(PAT)を設定する必要があります。
以下、簡単にPATの設定方法を説明します。
より詳しくは[GitHubのドキュメント](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry)をご参照ください。

PATが手に入ったら以下の内容の`.npmrc`ファイルをホームディレクトリに作成してください。

```
//npm.pkg.github.com/:_authToken=$YOUR_GITHUB_PAT
```

`$YOUR_GITHUB_PAT`はご自身のPATに置き換えてください。

プロジェクトのルートディレクトリには以下の内容の`.npmrc`ファイルを作成してください。

```
@codemonger-io:registry=https://npm.pkg.github.com
```

これで以下のコマンドで*開発者用パッケージ*をインストールできます。

```sh
npm install @codemonger-io/mapbox-collision-boxes@0.3.0-abc1234
```

`abc1234`はインストールしたい*スナップショット*の短いコミットハッシュに置き換えてください。

### 使い方

以下のスニペットはクリックしたシンボルに画面上で隠されているFeatureを集めてくる例です。

```ts
import mapboxgl from 'mapbox-gl';
import { boxesIntersect, collectCollisionBoxesAndFeatures } from '@codemonger-io/mapbox-collision-boxes';

const map = new mapboxgl.Map(
    // ... マップの初期化
);
// ... その他の設定
const layerId = 'cats-and-dogs'; // カスタムレイヤーを追加した想定
const map.on('click', layerId, async event => {
    const clickedFeatureId = event.features[0].id;
    const collisionBoxes = await collectCollisionBoxesAndFeatures(map, layerId);
    const clickedBox = collisionBoxes.find(box => box.feature.id === clickedFeatureId);
    const hiddenBoxes = collisionBoxes.filter(box => box !== clickedBox && boxesIntersect(box.box, clickedBox.box));
    const hiddenFeatures = hiddenBoxes.map(box => box.feature);
    // ... Featureの処理
});
```

[`example`](./example)フォルダに完成したプロジェクトがあります。

### 型の互換性に関する留意点

このライブラリは`mapbox-gl`のバージョン2.xと3.xの両方をサポートしていますが、このライブラリをビルドした`mapbox-gl`のバージョン(3.13.0)と異なるバージョンを使っている場合は`collectCollisionBoxesAndFeatures`関数の呼び出し箇所で型エラーが発生する可能性があります。
型エラーが出た場合は無視するか抑制してください。

## 動機

私はマップ上に`mapbox-gl`の[Symbol Layer](https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/#symbol)を使ってカスタムシンボルを表示するアプリを開発しています。
`mapbox-gl`は画面上でシンボルが被ると最初のものだけ表示し、他の重なるものは隠してしまいます。
私の知る限り、`mapbox-gl`には画面上で特定のシンボルによって隠されているシンボルを取得するAPIはありません。
開発中のアプリでは非表示のものも含めてクリックされたポイントにあるすべてのシンボルをリストしたいので、これでは不都合です。
`mapbox-gl`に衝突検出をスキップさせてすべてのシンボルを画面に表示させる[オプション](https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/#layout-symbol-icon-allow-overlap)はありますが、重なるシンボルがたくさんある場合は画面がごちゃごちゃし過ぎてしまいます。

ということで**Mapboxマップ上で特定のシンボルと重なるシンボルを集めることのできるライブラリを開発**することにしました。

より詳しくは[私のブログ投稿](https://codemonger.io/ja/blog/0009-mapbox-collision-boxes/)をご覧ください。

## APIドキュメント

[`api-docs/markdown/index.md`](./api-docs/markdown/index.md)をご覧ください。

## Tips

### ビューポートオフセット

[`collectCollisionBoxesAndFeatures`](./api-docs/markdown/mapbox-collision-boxes.collectcollisionboxesandfeatures.md)が集める衝突ボックスは固定のオフセットを含んでいます。
xとyの両軸について実際の画面位置 + `100`[^1]になっています。
オフセットは衝突ボックス同士の衝突判定には影響しないため、このライブラリでは不必要な計算を避けるためにそのままにしてあります。
衝突ボックスを実際の画面に投影したい場合は、xとy軸の値から`100`を引かなければなりません。

[^1]: この定数は`viewportPadding`として https://github.com/mapbox/mapbox-gl-js/blob/e29e113ff5e1f4c073f84b8cbe546006d2fb604f/src/symbol/collision_index.js#L50 に定義されていますが、`mapbox-gl`はエクスポートしていません。

## ライセンス

このライブラリは`mapbox-gl`からコードを拝借しているので、[Mapbox Web SDKライセンス](https://github.com/mapbox/mapbox-gl-js?tab=readme-ov-file#license)が適用されるはずです。
簡単に言うと、Mapbox TOSに従って適切なMapbox製品と組み合わせている限り使用することができます。
とはいえ私は法律の専門家ではないので、**皆さん自身の責任で**このライブラリをご使用ください。

## 開発

### 依存関係の解決

```sh
pnpm install --frozen-lockfile
```

### タイプチェック

```sh
pnpm type-check
```

### ライブラリをビルドする

```sh
pnpm build
```