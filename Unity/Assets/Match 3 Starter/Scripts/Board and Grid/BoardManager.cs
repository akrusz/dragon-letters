using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

public class BoardManager : MonoBehaviour {
	public static BoardManager instance;
    public List<LetterTile> letters = new List<LetterTile>();
	public GameObject tile;
	public int tileCountX, tileCountY;

	private GameObject[,] tiles;

	public bool IsShifting { get; set; }

	void Start () {
		instance = GetComponent<BoardManager>();

        tile.SetActive(true);
		Vector2 offset = tile.GetComponent<SpriteRenderer>().bounds.size;
        Debug.Log(offset);
        CreateBoard(offset.x, offset.y);
    }

	private void CreateBoard (float xOffset, float yOffset)
    {
		tiles = new GameObject[tileCountX, tileCountY];

        float startX = transform.position.x;
		float startY = transform.position.y;
        
		for (int x = 0; x < tileCountX; x++)
        {
			for (int y = 0; y < tileCountY; y++)
            {
                GameObject newTile = Instantiate(tile,
                    new Vector3(startX + (xOffset * x),
                                startY + (yOffset * y), 0),
                                tile.transform.rotation);
				tiles[x, y] = newTile;
				newTile.transform.parent = transform;

                var possibleLetters = new List<LetterTile>();
                possibleLetters = letters.ToList();

                LetterTile newLetterTile = possibleLetters[Random.Range(0, possibleLetters.Count)];
                Debug.Log(newLetterTile.Sprite.name);
                Debug.Log(newTile.transform.position);
                newTile.GetComponent<SpriteRenderer>().sprite = newLetterTile.Sprite;
			}
        }
    }

	public IEnumerator FindNullTiles() {
		for (int x = 0; x < tileCountX; x++) {
			for (int y = 0; y < tileCountY; y++) {
				if (tiles[x, y].GetComponent<SpriteRenderer>().sprite == null) {
					yield return StartCoroutine(ShiftTilesDown(x, y));
					break;
				}
			}
		}

		for (int x = 0; x < tileCountX; x++) {
			for (int y = 0; y < tileCountY; y++) {
				tiles[x, y].GetComponent<Tile>().ClearAllMatches();
			}
		}
	}

	private IEnumerator ShiftTilesDown(int x, int yStart, float shiftDelay = .03f) {
		IsShifting = true;
		List<SpriteRenderer> renders = new List<SpriteRenderer>();
		int nullCount = 0;

		for (int y = yStart; y < tileCountY; y++) {
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
				renders[k + 1].sprite = GetNewLetterTile(x, tileCountY - 1).Sprite;
			}
		}
		IsShifting = false;
	}

	private LetterTile GetNewLetterTile(int x, int y) {
		List<LetterTile> possibleLetters = new List<LetterTile>();
		possibleLetters.AddRange(letters);

        return possibleLetters[Random.Range(0, possibleLetters.Count)];
	}

}
