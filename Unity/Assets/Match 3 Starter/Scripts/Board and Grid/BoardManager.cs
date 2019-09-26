using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using UnityEngine.UI;

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
        CreateBoard(tile.GetComponent<Image>().sprite.rect.width, tile.GetComponent<Image>().sprite.rect.height);
    }

	private void CreateBoard (float xOffset, float yOffset)
    {
		tiles = new GameObject[tileCountX, tileCountY];
        GameObject t = Instantiate(tile,
                    new Vector3(0,0, 0),
                               tile.transform.rotation);
        float startX = transform.position.x;
		float startY = transform.position.y;
        Debug.Log(transform.position);
        Debug.Log(xOffset);
        Debug.Log(yOffset);
		for (int x = 0; x < tileCountX; x++)
        {
			for (int y = 0; y < tileCountY; y++)
            {
                GameObject newTile = Instantiate(tile,
                    new Vector3(startX + (xOffset * x),
                                startY + (yOffset * y), 0),
                                tile.transform.rotation);
				tiles[x, y] = newTile;
                newTile.transform.SetParent(transform);

                var possibleLetters = new List<LetterTile>();
                possibleLetters = letters.ToList();

                LetterTile newLetterTile = possibleLetters[Random.Range(0, possibleLetters.Count)];
                newTile.GetComponent<Image>().sprite = newLetterTile.Sprite;
                Debug.Log(newTile.GetComponent<Image>().transform.position);
            }
        }
    }

	public IEnumerator FindNullTiles() {
		for (int x = 0; x < tileCountX; x++) {
			for (int y = 0; y < tileCountY; y++) {
				if (tiles[x, y].GetComponent<Image>().sprite == null) {
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
		List<Image> renders = new List<Image>();
		int nullCount = 0;

		for (int y = yStart; y < tileCountY; y++) {
			Image render = tiles[x, y].GetComponent<Image>();
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
