using System;
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

    public static string GetRandom(int? length, IList<Tuple<int, string>> filters)
    {
        if (length is null && !(filters is null))
            throw new NotImplementedException("Can only filter words of a given length");

        var filteredWordList = (length is null) ? wordList : wordsByLength[length.Value];
        if(filters != null)
        {
            var randomWordOrder = Enumerable.Range(1, filteredWordList.Count).OrderBy(_ => UnityEngine.Random.Range(0,1));
            foreach (var index in randomWordOrder) {
                var word = filteredWordList[index];
                var match = true;
                foreach (var filter in filters)
                {
                    // for each (int, string) pair, check if the int-th letter of the word is string
                    if(word[filter.Item1].ToString() != filter.Item2)
                    {
                        match = false;
                    }
                }
                if (match)
                    return word;
            }
            return null;
        }

        return filteredWordList[(int) Mathf.Floor(UnityEngine.Random.Range(0, filteredWordList.Count))];
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