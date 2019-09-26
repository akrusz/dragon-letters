using UnityEngine;
using System.Collections.Generic;
using System.Linq;
using System;
using UnityEngine.EventSystems;
using UnityEngine.UI;

public class Tile : MonoBehaviour, IBeginDragHandler, IDragHandler, IEndDragHandler, IPointerEnterHandler
{
	private static Tile currentlyDraggingTile = null;
    private static Vector3 emptyTilePosition;
    
	public Image tileImage;

    void Awake()
    {
        tileImage = GetComponent<Image>();
        transform.position = new Vector3(1,1,1);
        Debug.Log(tileImage.sprite.name);
    }

	private void Select() {
	}

	private void Deselect() {
	}

    void Update()
    {
        transform.position = Input.mousePosition;
    }

    void OnMouseDown() {
		// Not Selectable conditions
		if (tileImage.sprite == null || BoardManager.instance.IsShifting) {
			return;
		}
        emptyTilePosition = transform.position;
        Select();
    }

    void OnMouseUp()
    {
        Deselect();
    }

    public void OnBeginDrag(PointerEventData pointerEventData)
    {
        currentlyDraggingTile = this;
        emptyTilePosition = transform.position;
        SFXManager.instance.PlaySFX(Clip.Select);
        tileImage.enabled = false;
    }

    public void OnDrag(PointerEventData pointerEventData)
    {
        Vector3 objPosition = Camera.main.ScreenToWorldPoint(pointerEventData.position);
        transform.position = new Vector3(objPosition.x, objPosition.y, transform.position.z);
    }

    public void OnEndDrag(PointerEventData pointerEventData)
    {
        currentlyDraggingTile = null;
        tileImage.color = new Color(1f, 1f, 1f, 1f);
        tileImage.enabled = true;
    }

    public void OnPointerEnter(PointerEventData pointerEventData)
    {
        if (!(currentlyDraggingTile is null))
        {
            Debug.Log(transform.position);
            Debug.Log("Cursor Entering " + tileImage.sprite.name + " GameObject");
            var currentPosition = transform.position;
            transform.position = emptyTilePosition;
            emptyTilePosition = currentPosition;
            Debug.Log(transform.position);
        }
    }
    
	private List<GameObject> FindMatch(Vector2 castDir) {
		List<GameObject> tilesInDirection = new List<GameObject>();
		RaycastHit2D hit = Physics2D.Raycast(transform.position, castDir);
        string tileLetter = tileImage.sprite?.name.Split('_')[1].ToLower();
		while (hit.collider != null) {
			tilesInDirection.Add(hit.collider.gameObject);
			hit = Physics2D.Raycast(hit.collider.transform.position, castDir);
		}

        var lettersInDirection = new List<string> { tileLetter };
        lettersInDirection.AddRange(tilesInDirection.Select(
            mt => mt.GetComponent<Image>()?.sprite?.name.Split('_')[1].ToLower()));
        for(var wordLen = tilesInDirection.Count + 1; wordLen > 3; wordLen--)
        {
            string potentialWord = String.Join("", lettersInDirection.Take(wordLen).ToList());
            if (SpellCheckerInstance.Check(potentialWord))
            {
                // -1 since the starting tile isn't here
                Debug.Log(potentialWord);
                return tilesInDirection.Take(wordLen - 1).ToList();
            }
        }
		return new List<GameObject>();
	}

	private void ClearMatch(Vector2[] paths) {
		List<GameObject> matchingTiles = new List<GameObject>();
		for (int i = 0; i < paths.Length; i++) { matchingTiles.AddRange(FindMatch(paths[i])); }
		if (matchingTiles.Count >= 2) {
			for (int i = 0; i < matchingTiles.Count; i++) {
				matchingTiles[i].GetComponent<Image>().sprite = null;
			}
			matchFound = true;
		}
	}

	private bool matchFound = false;
	public void ClearAllMatches() {
		if (tileImage.sprite == null)
			return;
		ClearMatch(new Vector2[2] { Vector2.right, Vector2.down });
		if (matchFound) {
			tileImage.sprite = null;
			matchFound = false;
			StopCoroutine(BoardManager.instance.FindNullTiles()); //Add this line
			StartCoroutine(BoardManager.instance.FindNullTiles()); //Add this line
			SFXManager.instance.PlaySFX(Clip.Clear);
		}
	}

    
}