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

> Everything goes through the bpf syscall, which means that the user space program must create the maps and programs with separate invocations of the bpf syscall. So how does a BPF program reference a BPF map?
>
> This happens by first loading all the BPF maps, and storing their corresponding file descriptors (FDs). Then the ELF relocation table is used to identify each reference the BPF program makes to a given map; each such reference is then rewritten, so the BPF byte code instructions use the right map FD for each map.
>
> All this needs to be done before the BPF program itself can be loaded into the kernel. Fortunately, **the libbpf library handles the ELF object decoding and map reference relocation**, **transparently** to the user space program performing the loads.
