using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

public class BoardManager : MonoBehaviour {
	public static BoardManager instance;
    public List<LetterTile> letters = new List<LetterTile>();
	public GameObject tile;
	public int xSize, ySize;

	private GameObject[,] tiles;

	public bool IsShifting { get; set; }

	void Start () {
		instance = GetComponent<BoardManager>();

		Vector2 offset = tile.GetComponent<SpriteRenderer>().bounds.size;
        CreateBoard(offset.x, offset.y);
    }

	private void CreateBoard (float xOffset, float yOffset) {
		tiles = new GameObject[xSize, ySize];

        float startX = transform.position.x;
		float startY = transform.position.y;

		LetterTile[] previousLeft = new LetterTile[ySize]; // Add this line
		LetterTile previousBelow = null; // Add this line

		for (int x = 0; x < xSize; x++) {
			for (int y = 0; y < ySize; y++) {
				GameObject newTile = Instantiate(tile, new Vector3(startX + (xOffset * x), startY + (yOffset * y), 0), tile.transform.rotation);
				tiles[x, y] = newTile;
				newTile.transform.parent = transform; // Add this line

                var possibleLetters = new List<LetterTile>();
                possibleLetters = letters.ToList();

				possibleLetters.Remove(previousLeft[y]);
				possibleLetters.Remove(previousBelow);

                Sprite newSprite = possibleLetters[Random.Range(0, possibleLetters.Count)].Sprite;


                newTile.GetComponent<SpriteRenderer>().sprite = newSprite;
				previousLeft[y].Sprite = newSprite;
				previousBelow.Sprite = newSprite;
			}
        }
    }

	public IEnumerator FindNullTiles() {
		for (int x = 0; x < xSize; x++) {
			for (int y = 0; y < ySize; y++) {
				if (tiles[x, y].GetComponent<SpriteRenderer>().sprite == null) {
					yield return StartCoroutine(ShiftTilesDown(x, y));
					break;
				}
			}
		}

		for (int x = 0; x < xSize; x++) {
			for (int y = 0; y < ySize; y++) {
				tiles[x, y].GetComponent<Tile>().ClearAllMatches();
			}
		}
	}

	private IEnumerator ShiftTilesDown(int x, int yStart, float shiftDelay = .03f) {
		IsShifting = true;
		List<SpriteRenderer> renders = new List<SpriteRenderer>();
		int nullCount = 0;

		for (int y = yStart; y < ySize; y++) {
			SpriteRenderer render = tiles[x, y].GetComponent<SpriteRenderer>();
			if (render.sprite == null) {
				nullCount++;
			}
			renders.Add(render);
		}

		for (int i = 0; i < nullCount; i++) {
			GUIManager.instance.Score += 50; // Add this line here
			yield return new WaitForSeconds(shiftDelay);
			for (int k = 0; k < renders.Count - 1; k++) {
				renders[k].sprite = renders[k + 1].sprite;
				renders[k + 1].sprite = GetNewSprite(x, ySize - 1);
			}
		}
		IsShifting = false;
	}

	private Sprite GetNewSprite(int x, int y) {
		List<LetterTile> possibleLetters = new List<LetterTile>();
		possibleLetters.AddRange(letters);

        Sprite newSprite = possibleLetters[Random.Range(0, possibleLetters.Count)].Sprite;
        return newSprite;
	}

}
