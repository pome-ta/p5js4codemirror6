# 📝 2025/05/24

久々に再開。codesandbox は終了したので、
code App でjs (node) 関係をごにょごにょやる。



# 📝 2023/04/01

## codemirror とp5js を連動させて良い感じにする

とりま、リポジトリ作成

## 先にcodemirror のリハビリ

### get standard 的な

[CodeMirror Bundling Example](https://codemirror.net/examples/bundle/)

自分の環境としては、iOS のCodeSandbox を使う想定での設定。

### モジュール化

```.json
"build": "rollup -c --bundleConfigAsCjs"
```

`--bundleConfigAsCjs` これつけないとあかんくなったのかな？意味は理解していない


#### codeSandbox やとダメそうやな？

node のバージョンが悪いのか、ビルドできないな、、、
携帯メインでビルド必要になりそうだったら、ちょっとバージョン調整するか
