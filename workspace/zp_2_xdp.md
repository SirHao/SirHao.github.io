# 从XDP入手BPF（2）

入手，用的是github xdp 教程 [link](https://github.com/xdp-project/xdp-tutorial/)

系列：[从xdp入手Bpf1](./zp_1_xdp.html)

## Basic(续)

### Basic 03: （Map）

这一节主要讲述了Map在user space/kernel space的基本使用;

对于`kernel.c`

```c
# 声明map
struct bpf_map_def SEC("maps") ${map_name} = {
	.type        = BPF_MAP_TYPE_PERCPU_ARRAY, 
	.key_size    = sizeof(__u32),
	.value_size  = sizeof(struct datarec),
	.max_entries = XDP_ACTION_MAX,
};
# 找entry,然后拿到value更新
rec = bpf_map_lookup_elem(&${map_name}, &key);
```

对于`user.c`

```c
//...加载了bpf_obj,找map
struct bpf_map *map=bpf_object__find_map_by_name(bpf_obj,"${map name}");
//通过map找fd(其实就是map->fd)
int map_fd = bpf_map__fd(map);
//检查map
map_expect.key_size    = sizeof(__u32);
map_expect.value_size  = sizeof(struct datarec);
map_expect.max_entries = XDP_ACTION_MAX;
err = __check_map_fd_info(stats_map_fd, &info, &map_expect); //通过bpf_obj_get_info_by_fd找到info，和map_expect一一对比
//...attach prog到设备...
//获取map信息（以percpu为例）
unsigned int nr_cpus = bpf_num_possible_cpus();
struct datarec values[nr_cpus];   //自定义一个value结构体datarec数组
bpf_map_lookup_elem(fd, &key, values); //拿到数据,全局map更简单，传一个datarec
```

用户程序加载map的过程发生了什么：

> how does a BPF program reference a BPF map?
>
> 这首先是通过加载所有的BPF map，并存储它们相应的文件描述符（FD）。然后，ELF重定位表被用来识别BPF程序对给定map的每个reference；然后每个reference被重写，所以BPF字节码指令为每个map使用正确的map FD。
>
> 所有这些都需要在BPF program本身被加载到内核之前完成。libbpf库处理ELF object decoding和map reference relocation，对执行加载的用户空间程序是透明的。
