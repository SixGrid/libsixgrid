import { Client } from "."

export default class Searcher
{
    public Client: Client;
    public constructor(client: Client)
    {
        this.Client = client;
    }

    public Query(query: string) : SearchInstance
    {
        let isValid: boolean = this.IsQueryValid(query)
        if (!isValid)
            throw new Error(`Search query '${query}' is invalid`)
        let instance: SearchInstance = new SearchInstance(this, query)
    }

    private QueryRegExpTable = {
        element: /[~\-]{0,1}[0-9a-zA-Z]+(_[0-9a-zA-Z]{1,}){0,}[\*]{0,1}/i,
        usr: /user:[a-z0-9_\-]+/i,
        usrid: /user:![0-9]+/i,
        usrfav: /fav(oritedby|):[a-z0-9_\-]/i,
        usrvote: /voted(up|down|):[a-z0-9_\-]/i,
        usrappr: /approver:[a-z0-9_\-]/i,
        usrdel: /deletedby:[a-z0-9_\-]/i,
        usrcomment: /commenter:[a-z0-9_\-]/i,
        usrnote: /noteupdater:[a-z0-9_\-]/i,

        postid: /id:[0-9]+/i,
        postscore: /score:(([<>]{1}([=]{0,1}|))|)[0-9]+/i,
        postfav: /favcount:(<|<=|)[0-9]+/i,
        postcommentcount: /comment_count:[0-9]+/i,
        posttags: /tagcount:[0-9]+/i,
        postgenerictags: /gentags:[0-9]+/i,
        postartisttags: /arttags:[0-9]+/i,
        postchartags: /chartags:[0-9]+/i,
        postcopytags: /copytags:[0-9]+/i,
        postspeciestags: /spectags:[0-9]+/i,
        postinvalidtags: /invtags:[0-9]+/i,
        postloretags: /lortags:[0-9]+/i,

        imagewidth: /width:[0-9]+/i,
        imageheight: /height:[0-9]+/i,
        imagempixels: /mpixels:[0-9]+/i,
        imageratio: /mpixels:[0-9]+(\.[0-9]+){0,1}/i,
    }

    public IsQueryValid(query: string) : boolean
    {
        let entries = Object.entries(this.QueryRegExpTable)
        let querySplit = query.split(' ')
        for (var q in querySplit)
        {
            for (let i = 0; i < entries.length; i++)
            {
                if (q.match(entries[i][1]) == null)
                    return false
            }
        }
        return true
    }
}