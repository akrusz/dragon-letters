using UnityEngine;
using System.Collections.Generic;
using System.Linq;
using System;
using UnityEngine.EventSystems;

public class Tile : MonoBehaviour, IBeginDragHandler, IDragHandler, IEndDragHandler, IPointerEnterHandler
{
	private static Color selectedColor = new Color(.8f, .8f, .3f, 1.0f);
	private static Tile currentlyDraggingTile = null;
	private static Vector3 previouslyMovedTilePosition;
    
	private SpriteRenderer render;

    void Awake() {
		render = GetComponent<SpriteRenderer>();
    }

	private void Select()
    {
    }

	private void Deselect() {
	}

    void Update()
    {
    }

    void OnMouseDown()
    {
		// Not Selectable conditions
		if (render.sprite == null || BoardManager.instance.IsShifting) {
			return;
		}
        previouslyMovedTilePosition = transform.position;
        Select();
    }

    void OnMouseUp()
    {
        Deselect();
    }

    public void OnBeginDrag(PointerEventData pointerEventData)
    {
        Debug.Log(transform.position);
        render.sortingOrder = 1000;
        render.color = new Color(1f, 1f, 1f, 0.7f);
        currentlyDraggingTile = this;
        previouslyMovedTilePosition = transform.position;
        SFXManager.instance.PlaySFX(Clip.Select);
    }

    public void OnDrag(PointerEventData pointerEventData)
    {
        Vector3 objPosition = Camera.main.ScreenToWorldPoint(pointerEventData.position);
        transform.position = new Vector3(objPosition.x - 0.5f, objPosition.y + 0.5f, transform.position.z);
    }

    public void OnEndDrag(PointerEventData pointerEventData)
    {
        transform.position = previouslyMovedTilePosition;
        currentlyDraggingTile = null;
        render.color = new Color(1f, 1f, 1f, 1f);
        render.sortingOrder = 1;
    }

    public void OnPointerEnter(PointerEventData pointerEventData)
    {
        if (!(currentlyDraggingTile is null))
        {
            Debug.Log(transform.position);
            Debug.Log("Cursor Entering " + render.sprite.name + " GameObject");
            var currentPosition = transform.position;
            transform.position = previouslyMovedTilePosition;
            previouslyMovedTilePosition = currentPosition;
            Debug.Log(transform.position);
        }
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