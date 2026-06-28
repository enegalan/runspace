-module(runspace_bootstrap).
-export([main/0]).

main() ->
    os:putenv("RUNSPACE_FRAMEWORK_ROOT", '{{skeleton_root}}'),
    os:putenv("RUNSPACE_ENTRY_PATH", '{{entry_file}}'),
    Root = os:getenv("RUNSPACE_FRAMEWORK_ROOT"),
    LibDir = filename:join([Root, "_build", "default", "lib"]),
    add_code_paths(LibDir),
    Entry = os:getenv("RUNSPACE_ENTRY_PATH"),
    case compile:file(Entry) of
        {ok, EntryMod} ->
            apply(EntryMod, main, []);
        Error ->
            io:format("~p~n", [Error]),
            halt(1)
    end,
    init:stop().

add_code_paths(LibDir) ->
    case filelib:is_dir(LibDir) of
        true ->
            {ok, Apps} = file:list_dir(LibDir),
            lists:foreach(
                fun(App) ->
                    code:add_pathz(filename:join([LibDir, App, "ebin"]))
                end,
                Apps
            );
        false ->
            ok
    end.
