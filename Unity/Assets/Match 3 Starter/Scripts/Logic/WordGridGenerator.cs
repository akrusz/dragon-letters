using UnityEngine;

public class WordGridGenerator : ScriptableObject
{
    public static string[][] Generate(int x,int y, int minWordLength)
    {
        var longer = Mathf.Max(x, y);
        var shorter = Mathf.Min(x, y);

        string[][] grid = new string[shorter][];
        if (shorter == minWordLength)
        {

        }
        else if (shorter < 2 * minWordLength)
        {

        }
        else {
        }

        return (x == longer) ? grid : Transpose(grid);
    }

    private static string[][] Transpose(string[][] grid)
    {
        var transposedGrid = new string[grid[0].Length][];
        for(var i = 0; i < grid.Length; i++)
        {
            for (var j = 0; j < grid[0].Length; j++)
            {
                transposedGrid[j][i] = grid[i][j];
            }
        }
        return transposedGrid;
    }
}