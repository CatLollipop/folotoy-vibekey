import Foundation
import zlib

/// gzip 压缩 / 解压(火山引擎协议要求)。使用系统 zlib,windowBits = 31 表示 gzip 格式。
nonisolated enum Gzip {
    enum Failure: Error { case zlib(Int32), tooLarge }

    /// 解压结果上限,防止异常数据占满内存。
    static let maxOutput = 4 * 1_048_576

    static func compress(_ data: Data) throws -> Data {
        var stream = z_stream()
        let status = deflateInit2_(&stream, Z_DEFAULT_COMPRESSION, Z_DEFLATED, 31, 8, Z_DEFAULT_STRATEGY,
                                   ZLIB_VERSION, Int32(MemoryLayout<z_stream>.size))
        guard status == Z_OK else { throw Failure.zlib(status) }
        defer { deflateEnd(&stream) }
        return try run(&stream, input: data, decompress: false)
    }

    static func decompress(_ data: Data) throws -> Data {
        var stream = z_stream()
        let status = inflateInit2_(&stream, 31, ZLIB_VERSION, Int32(MemoryLayout<z_stream>.size))
        guard status == Z_OK else { throw Failure.zlib(status) }
        defer { inflateEnd(&stream) }
        return try run(&stream, input: data, decompress: true)
    }

    private static func run(_ stream: inout z_stream, input: Data, decompress: Bool) throws -> Data {
        var output = Data()
        // removeFirst后的空Data仍可能保留非零起始索引；Foundation对此切片的可变借用会trap。
        // 显式物化连续独立字节，只读借用给zlib，避免Data切片COW及输入别名的可变访问。
        let inputBytes = [UInt8](input)
        try inputBytes.withUnsafeBufferPointer { source in
            stream.next_in = UnsafeMutablePointer(mutating: source.baseAddress)
            stream.avail_in = uInt(source.count)
            var buffer = [UInt8](repeating: 0, count: 16_384)
            var status: Int32 = Z_OK
            repeat {
                let produced: Int = buffer.withUnsafeMutableBytes { destination in
                    stream.next_out = destination.bindMemory(to: Bytef.self).baseAddress
                    stream.avail_out = uInt(destination.count)
                    status = decompress ? inflate(&stream, Z_NO_FLUSH) : deflate(&stream, Z_FINISH)
                    return destination.count - Int(stream.avail_out)
                }
                guard status == Z_OK || status == Z_STREAM_END || (status == Z_BUF_ERROR && produced > 0) else {
                    throw Failure.zlib(status)
                }
                output.append(contentsOf: buffer.prefix(produced))
                if output.count > maxOutput { throw Failure.tooLarge }
                // 输入耗尽不是gzip结束：截断头可能返回Z_OK且0输出，仍须确认Z_STREAM_END。
                // 继续inflate会以Z_BUF_ERROR失败，避免把半包当作完整payload。
            } while status != Z_STREAM_END
        }
        return output
    }
}
