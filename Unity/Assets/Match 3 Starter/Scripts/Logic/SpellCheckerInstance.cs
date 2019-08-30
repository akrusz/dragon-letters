using System.Collections.Generic;
using System.IO;
using UnityEngine;

public static class SpellCheckerInstance
{
    private static readonly TextAsset wordList = (TextAsset)Resources.Load("wordlist", typeof(TextAsset));
    private static HashSet<string> wordSet;

    static SpellCheckerInstance()
    {
        ReadTextFile(wordList);
    }

    public static bool Check(string word)
    {
        return wordSet.Contains(word);
    }

    private static void ReadTextFile(TextAsset wordList)
    {
        wordSet = new HashSet<string>(wordList.text.Split('\n'));
    }
}