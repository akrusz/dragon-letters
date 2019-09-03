using UnityEngine;
using System.Collections.Generic;
using System.Linq;
using System;
using UnityEngine.EventSystems;

public class Tile : MonoBehaviour, IBeginDragHandler, IDragHandler, IEndDragHandler, IPointerEnterHandler
{
	private static Color selectedColor = new Color(.8f, .8f, .3f, 1.0f);
	private static Tile currentlySelectedTile = null;
	private static Vector3 previouslyMovedTilePosition;
    
	private SpriteRenderer render;

	private Vector2[] adjacentDirections = new Vector2[] { Vector2.up, Vector2.down, Vector2.left, Vector2.right };

    private bool isPressed = false;

    void Awake() {
		render = GetComponent<SpriteRenderer>();
    }

	private void Select() {
	}

	private void Deselect() {
	}

    void Update()
    {
    }

    void OnMouseDown() {
		// Not Selectable conditions
		if (render.sprite == null || BoardManager.instance.IsShifting) {
			return;
		}

        isPressed = true;
        Select();
    }

    void OnMouseUp()
    {
        isPressed = false;
        Deselect();
    }

    public void OnBeginDrag(PointerEventData pointerEventData)
    {
        currentlySelectedTile = gameObject.GetComponent<Tile>();
        previouslyMovedTilePosition = currentlySelectedTile.transform.position;
        render.color = new Color(1f, 1f, 1f, .7f);
        render.sortingOrder = 1000;
        SFXManager.instance.PlaySFX(Clip.Select);
    }

    public void OnDrag(PointerEventData pointerEventData)
    {
        Vector2 MousePosition = new Vector2(Input.mousePosition.x, Input.mousePosition.y);
        Vector2 objPosition = Camera.main.ScreenToWorldPoint(MousePosition);
        transform.position = objPosition;
    }

    public void OnEndDrag(PointerEventData pointerEventData)
    {
        currentlySelectedTile = null;
        render.color = new Color(1f, 1f, 1f, 1f);
        render.sortingOrder = 1;
    }

    public void OnPointerEnter(PointerEventData pointerEventData)
    {
        Debug.Log(transform.position);
        if(!(currentlySelectedTile is null))
        {
            Debug.Log(currentlySelectedTile);
            var currentPosition = gameObject.GetComponent<Tile>().transform.position;
            transform.position = previouslyMovedTilePosition;
            previouslyMovedTilePosition = currentPosition;
        }
    }

    public void SwapSprite(SpriteRenderer render2) {
		if (render.sprite == render2.sprite) {
			return;
		}

		Sprite tempSprite = render2.sprite;
		render2.sprite = render.sprite;
		render.sprite = tempSprite;
		SFXManager.instance.PlaySFX(Clip.Swap);
		GUIManager.instance.MoveCounter--; // Add this line here
	}

	private GameObject GetAdjacent(Vector2 castDir) {
		RaycastHit2D hit = Physics2D.Raycast(transform.position, castDir);
		if (hit.collider != null) {
			return hit.collider.gameObject;
		}
		return null;
	}

	private List<GameObject> GetAllAdjacentTiles() {
		List<GameObject> adjacentTiles = new List<GameObject>();
		for (int i = 0; i < adjacentDirections.Length; i++) {
			adjacentTiles.Add(GetAdjacent(adjacentDirections[i]));
		}
		return adjacentTiles;
	}

	private List<GameObject> FindMatch(Vector2 castDir) {
		List<GameObject> tilesInDirection = new List<GameObject>();
		RaycastHit2D hit = Physics2D.Raycast(transform.position, castDir);
        string tileLetter = render.sprite?.name.Split('_')[1].ToLower();
		while (hit.collider != null) {
			tilesInDirection.Add(hit.collider.gameObject);
			hit = Physics2D.Raycast(hit.collider.transform.position, castDir);
		}

        var lettersInDirection = new List<string> { tileLetter };
        lettersInDirection.AddRange(tilesInDirection.Select(
            mt => mt.GetComponent<SpriteRenderer>()?.sprite?.name.Split('_')[1].ToLower()));
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
				matchingTiles[i].GetComponent<SpriteRenderer>().sprite = null;
			}
			matchFound = true;
		}
	}

	private bool matchFound = false;
	public void ClearAllMatches() {
		if (render.sprite == null)
			return;
		ClearMatch(new Vector2[2] { Vector2.right, Vector2.down });
		if (matchFound) {
			render.sprite = null;
			matchFound = false;
			StopCoroutine(BoardManager.instance.FindNullTiles()); //Add this line
			StartCoroutine(BoardManager.instance.FindNullTiles()); //Add this line
			SFXManager.instance.PlaySFX(Clip.Clear);
		}
	}

    
}