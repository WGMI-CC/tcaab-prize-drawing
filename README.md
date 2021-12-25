# tcaab-prize-drawing

This repo is a public record of the prize drawing process for the Two Coffees and One Beer event by WGMI NFT Collector's Club (https://wgmi.cc).

## Setup
```
npm install
```

## Running the prize drawing
The prize drawing happens in four steps. 

### The Holders Snapshot
First, a snapshot TCaaB holders and their TCaaB mints were gathered from sol-nft.tools by visiting https://www.sol-nft.tools/get-mints and using the
TCaaB candy machine ID: `9gorTuynN3tntCZvyF63ySFzk64thsxe1h3potB3Lxuc`. When prompted, we used the output to create a snapshot (of holders). The output of this second step
was saved to [./data/holder-mints.json](./data/holder-mints.json). 

### The Holder Scores
Second, we computed the scores of each holder based on the number of coffees and beers they had of each brand in their wallets from the snapshot.

```
npm run evaluate-collections-prod
```

In the event the script failed to retrieve some metadata, it would retry for a configured number of times before failing the entire script. In other words, no holder would be left behind. Additionally, the script would compare the number of TCaaB NFTs found with this method to those reported by the sol-nft.tools website to ensure consistent counting across both methods. For this reason, **it was vital the snapshot and the score counting run in quick succession**.

Once the script completed, it wrote the result to [./data/scores.json](./data/scores.json).

### The Prize Drawing
Third, prizes were drawn based on the number of elligible entries each holder had as computed from the holder snapshot. 

```
npm run choose-winners-prod
```

For each prize in the TCaaB prize pool, this script selected a holder at random from the pool of eligible entries for that prize, which may have included multiple entries for a given holder who had multiple sets of the same brand and/or multiple branded sets in the same prize tier. If a holder's entry was chosen and thus won that prize, that entry was removed from the entry pool for the next prize drawing in that pool. 

When the script completed, it wrote the result to [./data/winners.json](./data/winners.json).

### Prize Distribution
A fourth step, the distribution of prizes, was manually. Each transaction was added to [./data/winners.json](./data/winners.json).