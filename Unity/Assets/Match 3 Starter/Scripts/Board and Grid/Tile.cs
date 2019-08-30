using UnityEngine;
using System.Collections.Generic;
using System.Linq;
using System;

public class Tile : MonoBehaviour {
	private static Color selectedColor = new Color(.5f, .5f, .5f, 1.0f);
	private static Tile previousSelected = null;

	private SpriteRenderer render;
	private bool isSelected = false;

	private Vector2[] adjacentDirections = new Vector2[] { Vector2.up, Vector2.down, Vector2.left, Vector2.right };

	void Awake() {
		render = GetComponent<SpriteRenderer>();
    }

	private void Select() {
		isSelected = true;
		render.color = selectedColor;
		previousSelected = gameObject.GetComponent<Tile>();
		SFXManager.instance.PlaySFX(Clip.Select);
	}

	private void Deselect() {
		isSelected = false;
		render.color = Color.white;
		previousSelected = null;
	}

	void OnMouseDown() {
		// Not Selectable conditions
		if (render.sprite == null || BoardManager.instance.IsShifting) {
			return;
		}

		if (isSelected) { // Is it already selected?
			Deselect();
		} else {
			if (previousSelected == null) { // Is it the first tile selected?
				Select();
			} else {
				if (GetAllAdjacentTiles().Contains(previousSelected.gameObject)) { // Is it an adjacent tile?
					SwapSprite(previousSelected.render);
					previousSelected.ClearAllMatches();
					previousSelected.Deselect();
					ClearAllMatches();
				} else {
					previousSelected.GetComponent<Tile>().Deselect();
					Select();
				}
			}
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
        for(var wordLen = tilesInDirection.Count; wordLen > 2; wordLen--)
        {
            string potentialWord = String.Join("", lettersInDirection.Take(wordLen).ToList());
            Debug.Log(potentialWord);
            if (SpellCheckerInstance.Check(potentialWord))
            {
                Debug.Log("true");
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