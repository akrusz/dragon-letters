using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

public class BoardManager : MonoBehaviour {
	public static BoardManager instance;
    public List<LetterTile> letters = new List<LetterTile>();
	public GameObject tileObject;
	public int tileCountX, tileCountY;

	private GameObject[,] tiles;

	public bool IsShifting { get; set; }

	void Start () {
		instance = GetComponent<BoardManager>();
        tileObject.SetActive(true);
		Vector2 offset = tileObject.GetComponent<SpriteRenderer>().bounds.size;
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
                GameObject newTile = Instantiate(tileObject,
                    new Vector3(startX + (xOffset * x),
                                startY + (yOffset * y), 0),
                                tileObject.transform.rotation);
				tiles[x, y] = newTile;
                tiles[x, y].GetComponent<SpriteRenderer>().sortingOrder = 1;
                newTile.transform.parent = transform;
                newTile.GetComponent<Tile>().parentBoard = this;

                var possibleLetters = new List<LetterTile>();
                possibleLetters = letters.ToList();

                LetterTile newLetterTile = possibleLetters[Random.Range(0, possibleLetters.Count)];
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

    public void ClearAllMatches()
    {
        for (int x = 0; x < tileCountX; x++)
        {
            for (int y = tileCountY -  1; y < 0; y--)
            {
                var tile = tiles[x, y].GetComponent<Tile>();

                if (tile.render.sprite == null)
                    return;
                var matchFound = tile.ClearMatch(new Vector2[2] { Vector2.right, Vector2.down });
                if (matchFound)
                {
                    tile.render.sprite = null;
                    matchFound = false;
                    StopCoroutine(FindNullTiles()); //Add this line
                    StartCoroutine(FindNullTiles()); //Add this line
                    SFXManager.instance.PlaySFX(Clip.Clear);
                }
            }
        }
    }
}
