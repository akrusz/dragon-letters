using System.Collections.Generic;
using System.IO;
using UnityEngine;

public static class SpellCheckerInstance
{
    private static readonly string filePath = "/Text/wordlist.txt";
    private static HashSet<string> wordSet = new HashSet<string>();

    static SpellCheckerInstance()
    {
        ReadTextFile(filePath);
    }

    public static bool Check(string word)
    {
        return wordSet.Contains(word);
    }

    private static void ReadTextFile(string filePath)
    {
        var absolutePath = Application.dataPath + filePath;
        Debug.Log(absolutePath);
        StreamReader inp_stm = new StreamReader(absolutePath);

        while (!inp_stm.EndOfStream)
        {
            string line = inp_stm.ReadLine();
            wordSet.Add(line);
            Debug.Log(line);
            // Do Something with the input. 
        }

        inp_stm.Close();
    }
}