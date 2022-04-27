# 从XDP入手BPF（1）

之前零零散散看了一些bpf，但总忙起来的时候就忘的差不多了。打算做一系列的系统学习

初次重新入手，用的是github xdp 教程 [link](https://github.com/xdp-project/xdp-tutorial/)

## Basic

### Basic 01: （两种方式载入BPF）

> The LLVM+clang compiler turns this restricted-C code into **BPF-byte-code** and stores it in **an ELF object file**

编译后的.o产物为一个elf文件, 需要通过两种方法运行：

+ user code
+ IP2

**IP2**

使用现有的iptable载入，但缺点是无法使用Map

```shell
ip link set dev {dev name} xdpgeneric obj {elf file} sec xdp
ip link show dev {dev name}
ip link set dev {dev name} xdpgeneric off
```

**User Code**

使用libbpf通过system call载入，总共分两步：

```c
/* step1: Use libbpf for extracting BPF byte-code from BPF-ELF object, 
   and loading this into the kernel via bpf-syscall */
int prog_fd = -1;
struct bpf_object *obj;
int err = bpf_prog_load(filename, BPF_PROG_TYPE_XDP, &obj, &prog_fd);

/* step2:libbpf provide the XDP net_device link-level hook attach helper */
int devindex = if_nametoindex(devname);  //if_nametoindex是c的用户态net库函数
err = bpf_set_link_xdp_fd(devindex, prog_fd, xdp_flags);
```

> 自己尚未解决的issue https://github.com/xdp-project/xdp-tutorial/issues/38

> XDP_FLAGS_HW_MODE 在通过`bpf_prog_load_xattr`传入后可以实现硬件卸载

### Basic 02: （BPF object）

三个object 

-  `bpf_object`: 一个elf文件， 通过 `bpf_prog_load_xattr(...)` `bpf_prog_load(...)` 获取
- `bpf_program`：一个SEC，通过`bpf_object__find_program_by_title(...)`获取，并通过`bpf_program__fd`获取对应句柄
- `bpf_map`：bpf map



todo: assignment阅读 https://github.com/xdp-project/xdp-tutorial/tree/master/basic02-prog-by-name

