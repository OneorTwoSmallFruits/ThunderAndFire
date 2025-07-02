declare namespace Noname {
    interface Player {
        /**
         * 自定义抽牌方法，抽取指定数量的牌
         */
        diydraw(num?: number): void;

        // 其他扩展方法也可以加在这里
    }
}