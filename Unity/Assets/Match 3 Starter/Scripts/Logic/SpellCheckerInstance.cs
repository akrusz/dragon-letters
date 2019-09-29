using System.Collections.Generic;
using System.Linq;
using UnityEngine;

public static class SpellCheckerInstance
{
    private static readonly TextAsset wordAsset = (TextAsset)Resources.Load("wordlist", typeof(TextAsset));
    private static HashSet<string> wordSet;
    private static IList<string> wordList;
    private static Dictionary<int, List<string>> wordsByLength;

    static SpellCheckerInstance()
    {
        Hydrate(wordAsset);
    }

    public static string GetRandom(int? length)
    {
        var filteredWordList = (length is null) ? wordList : wordsByLength[length.Value];
        return filteredWordList[(int) Mathf.Floor(Random.Range(0, filteredWordList.Count))];
    }

    public static bool Check(string word)
    {
        return wordSet.Contains(word);
    }

    private static void Hydrate(TextAsset wordAsset)
    {
        wordList = wordAsset.text.Split('\n');
        wordSet = new HashSet<string>(wordList);
        foreach(var word in wordList)
        {
            if (!wordsByLength.ContainsKey(word.Length))
            {
                wordsByLength[word.Length] = new List<string>();
            }
            wordsByLength[word.Length].Add(word);
        }
    }
}